figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = (msg) => {
	if (msg.type === 'getStyles') {
		const selection = figma.currentPage.selection;
		if (selection.length === 2) {
			const frame1 = selection[0];
			const frame2 = selection[1];
			const cssStyles1 = getAllNodeStyles(frame1);
			const cssStyles2 = getAllNodeStyles(frame2);
			console.log("🚀 ---------------------------🚀")
			console.log("🚀 ~ cssStyles1:", cssStyles1)
			console.log("🚀 ~ cssStyles2:", cssStyles2)
			console.log("🚀 ---------------------------🚀")
			const comparisonResults = compareStyles(cssStyles1, cssStyles2, frame1.name, frame2.name);
			createComparisonFrame(comparisonResults);
		} else {
			figma.notify('請選擇兩個區塊💢');
		}
	}
};

function compareStyles(styles1, styles2, beforeName, afterName) {
	const results = [];
	let action = null;
	let beforeValue = null;
	let afterValue = null;
	let style = null;
	let nodeName = null;

	for (const key in styles1) {
		action = null;
		beforeValue = null;
		afterValue = null;
		style = null;
		nodeName = null;

		if (styles2.hasOwnProperty(key)) {
			const style1 = styles1[key];
			const style2 = styles2[key];

			for (const styleName in style1) {
				if (style2.hasOwnProperty(styleName)) {
					if (style1[styleName] !== style2[styleName]) {
						action = '變成了';
						beforeValue = style1[styleName];
						afterValue = style2[styleName];
						nodeName = key;
						style = styleName;
						break;
					}
				} else {
					action = '刪除了';
					beforeValue = style1[styleName];
					nodeName = key;
					style = styleName;
					break;
				}
			}

			if (!action) {
				for (const styleName in style2) {
					if (!style1.hasOwnProperty(styleName)) {
						action = '新增了';
						afterValue = style2[styleName];
						style = styleName;
						nodeName = key;
						break;
					}
				}
			}
		} else {
			action = '刪除了';
			beforeValue = styles1[key];
			style = key;
			nodeName = key;
		}

		if (action) {
			results.push({
				beforeName,
				afterName,
				style,
				action,
				beforeValue,
				afterValue,
				nodeName
			});
		} else {
			console.log('竟然有例外狀況？？');
			console.log({
				beforeName,
				afterName,
				style,
				action,
				beforeValue,
				afterValue,
				nodeName
			});
		}
	}

	for (const key in styles2) {
		if (!styles1.hasOwnProperty(key)) {
			results.push({
				beforeName,
				afterName,
				style: key,
				action: '新增了',
				beforeValue: null,
				afterValue: key,
				nodeName: key
			});
		}
	}
	return results;
}

function createComparisonFrame(results) {
	figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(() => {
		const frame = figma.createFrame();
		frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
		frame.name = 'Comparison Results';
		frame.paddingLeft = 20;
		frame.paddingRight = 20;
		frame.paddingTop = 20;
		frame.paddingBottom = 20;

		frame.layoutMode = "VERTICAL";
		frame.itemSpacing = 10;

		// Comparison Results 定位
		const afterFrame = figma.currentPage.selection[1];
		frame.x = afterFrame.x + afterFrame.width + 100;
		frame.y = afterFrame.y;

		results.forEach((result, index) => {
			const text = figma.createText();
			const defaultColor = { r: 0.858, g: 0.827, b: 0.827 }; // #DBD3D3
			const styleColor = { r: 0, g: 0, b: 0 }; // #000000
			const modifyColor = { r: 0.376, g: 0.400, b: 0.463 }; // #606676
			const addColor = { r: 0.447, g: 0.749, b: 0.471 }; // #72BF78
			const deleteColor = { r: 0.976, g: 0.329, b: 0.329 }; // #F95454
			const originValueColor = { r: 0.008, g: 0.298, b: 0.667 }; // #024CAA
			const changedColor = { r: 0.035, g: 0.063, b: 0.341 }; // #091057

			text.fontSize = 14;
			const segments = [];

			if (result.action === '變成了') {
				segments.push(
					{ text: result.afterName, color: modifyColor },
					{ text: ' - ', color: modifyColor },
					{ text: result.nodeName, color: modifyColor },
					{ text: ' 的 ', color: defaultColor },
					{ text: result.style, color: styleColor },
					{ text: ' 要從 ', color: defaultColor },
					{ text: result.beforeValue, color: originValueColor },
					{ text: ' -> ', color: defaultColor },
					{ text: result.afterValue, color: changedColor }
				);
			} else if (result.action === '刪除了') {
				segments.push(
					{ text: '刪除了 ', color: deleteColor },
					{ text: result.beforeName, color: deleteColor },
					{ text: ' 的 ', color: deleteColor },
					{ text: result.nodeName, color: deleteColor },
				);
			} else if (result.action === '新增了') {
				segments.push(
					{ text: '新增了 ', color: defaultColor },
					{ text: result.afterName, color: addColor },
					{ text: ' 的 ', color: defaultColor },
					{ text: result.nodeName, color: addColor }
				);
			}

			let currentIndex = 0;
			segments.forEach(segment => {
				text.insertCharacters(currentIndex, segment.text);
				text.setRangeFills(currentIndex, currentIndex + segment.text.length, [{ type: 'SOLID', color: segment.color }]);
				currentIndex += segment.text.length;
			});

			text.y = index * 20;
			frame.appendChild(text);
		});

		figma.currentPage.appendChild(frame);

		// 寬高根據內容自動調整
		frame.layoutSizingHorizontal = "HUG";
		frame.layoutSizingVertical = "HUG";

		figma.viewport.scrollAndZoomIntoView([frame]);
	}).catch(err => {
		console.error('Error loading font:', err);
	});
}

function getCSSStyles(node) {
	const width = node.width;
	const height = node.height;
	const fill = node.fills && node.fills.length > 0 ? node.fills[0].color : null;
	const fillColor = fill ? `rgba(${Math.round(fill.r * 255)}, ${Math.round(fill.g * 255)}, ${Math.round(fill.b * 255)}, ${fill.a ? fill.a : 1})` : 'none';
	const opacity = node.opacity !== undefined ? node.opacity : 1;
	const borderRadius = node.cornerRadius !== undefined ? `${node.cornerRadius}px` : '0px';
	const boxShadow = node.effects && node.effects.length > 0 ? node.effects.map(effect => {
		if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
			const { offset, radius, color } = effect;
			const shadowColor = `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a ? color.a : 1})`;
			return `${offset.x}px ${offset.y}px ${radius}px ${shadowColor}`;
		}
		return '';
	}).join(', ') : 'none';

	const margin = node.layoutPositioning === 'AUTO' ? `${node.layoutGrow * 100}%` : `${node.marginLeft || 0}px ${node.marginTop || 0}px ${node.marginRight || 0}px ${node.marginBottom || 0}px`;

	const padding = node.paddingLeft !== undefined ? `${node.paddingLeft}px ${node.paddingTop}px ${node.paddingRight}px ${node.paddingBottom}px` : '0px';

	const border = node.strokes && node.strokes.length > 0 ? node.strokes.map(stroke => {
		const strokeColor = `rgba(${Math.round(stroke.color.r * 255)}, ${Math.round(stroke.color.g * 255)}, ${Math.round(stroke.color.b * 255)}, ${stroke.color.a ? stroke.color.a : 1})`;
		return `${node.strokeWeight}px solid ${strokeColor}`;
	}).join(', ') : 'none';

	const color = node.fills && node.fills.length > 0 ? node.fills.map(fill => {
		const fillColor = `rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${fill.color.a ? fill.color.a : 1})`;
		return fillColor;
	}).join(', ') : 'none';

	const fontSize = node.fontSize ? `${node.fontSize}px` : 'inherit';
	const fontFamily = node.fontName ? node.fontName.family : 'inherit';
	const fontWeight = node.fontName ? node.fontName.style : 'normal';
	const textAlign = node.textAlignHorizontal ? node.textAlignHorizontal.toLowerCase() : 'left';

	const position = node.relativeTransform ? 'absolute' : 'relative';
	const translate = node.relativeTransform ? `${node.relativeTransform[0][2]}px, ${node.relativeTransform[1][2]}px` : 'none';
	const rotate = node.rotation ? `${node.rotation}deg` : 'none';

	const display = node.layoutMode ? (node.layoutMode === 'NONE' ? 'block' : node.layoutMode.toLowerCase()) : 'block';
	const top = node.y !== undefined ? `${node.y}px` : 'auto';
	const left = node.x !== undefined ? `${node.x}px` : 'auto';
	const right = node.width !== undefined && node.x !== undefined ? `${node.x + node.width}px` : 'auto';
	const bottom = node.height !== undefined && node.y !== undefined ? `${node.y + node.height}px` : 'auto';
	const gap = node.itemSpacing !== undefined ? `${node.itemSpacing}px` : '0px';

	const cssStyles = {
		display: display,
		gap: gap,
		position: position,
		top: top,
		left: left,
		right: right,
		bottom: bottom,
		width: `${width}px`,
		height: `${height}px`,
		margin: margin,
		padding: padding,
		translate: translate,
		rotate: rotate,
		border: border,
		borderRadius: borderRadius,
		boxShadow: boxShadow,
		backgroundColor: fillColor,
		opacity: opacity,
		fontSize: fontSize,
		fontFamily: fontFamily,
		fontWeight: fontWeight,
		textAlign: textAlign,
		color: color
	};

	return cssStyles;
}

function getAllNodeStyles(frame) {
	let styles = {};
	frame.findAll(node => node.visible).forEach(node => {
		styles[node.name] = getCSSStyles(node);
	});
	return styles;
}