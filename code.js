figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = (msg) => {
	if (msg.type === 'getStyles') {
		const selection = figma.currentPage.selection;
		if (selection.length === 2) {
			const frame1 = selection[0];
			const frame2 = selection[1];
			const cssStyles1 = getAllNodeStyles(frame1);
			const cssStyles2 = getAllNodeStyles(frame2);
			console.log('Frame 1 Styles:', cssStyles1);
			console.log('Frame 2 Styles:', cssStyles2);
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

	for (const key in styles1) {

		if (styles2.hasOwnProperty(key)) {
			const style1 = styles1[key];
			const style2 = styles2[key];

			for (const styleName in style1) {
				if (style2.hasOwnProperty(styleName)) {
					if (style1[styleName] !== style2[styleName]) {
						action = '變成了';
						beforeValue = style1[styleName];
						afterValue = style2[styleName];
						style = styleName;
						break;
					}
				} else {
					action = '遺失了';
					beforeValue = style1[styleName];
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
						break;
					}
				}
			}
		} else {
			action = '遺失了';
			beforeValue = styles1[key];
			style = key;
		}

		if (action) {
			results.push({
				beforeName,
				afterName,
				style,
				action,
				beforeValue,
				afterValue
			});
		} else {
			console.log('竟然有例外狀況？？');
			console.log({
				beforeName,
				afterName,
				style,
				action,
				beforeValue,
				afterValue
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
				afterValue: key
			});
		}
	}
	console.log("🚀 ---------------------🚀")
	console.log("🚀 ~ results:", results)
	console.log("🚀 ---------------------🚀")
	return results;
}

function createComparisonFrame(results) {
	figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(() => {
		const frame = figma.createFrame();
		frame.resize(400, results.length * 20 + 20);
		frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
		frame.name = 'Comparison Results';

		results.forEach((result, index) => {
			const text = figma.createText();
			text.fontSize = 14;
			text.fontName = { family: "Inter", style: "Regular" };

			const segments = [
				{ text: result.style, color: { r: 1, g: 1, b: 0 } }, // yellow
				{ text: ' 的 ', color: { r: 0.666, g: 0.666, b: 0.666 } }, // default color
				{ text: result.action, color: { r: 0, g: 0, b: 1 } }, // blue
			];

			if (result.action === '變成了') {
				segments.push(
					{ text: ' 從 ', color: { r: 0.666, g: 0.666, b: 0.666 } }, // default color
					{ text: result.beforeValue, color: { r: 1, g: 0, b: 0 } }, // red
					{ text: ' 變成了 ', color: { r: 0.666, g: 0.666, b: 0.666 } }, // default color
					{ text: result.afterValue, color: { r: 0, g: 1, b: 0 } } // green
				);
			} else if (result.action === '遺失了') {
				segments.push(
					{ text: ' ', color: { r: 0.666, g: 0.666, b: 0.666 } }, // default color
					{ text: result.beforeValue, color: { r: 1, g: 0, b: 0 } } // red
				);
			} else if (result.action === '新增了') {
				segments.push(
					{ text: ' ', color: { r: 0.666, g: 0.666, b: 0.666 } }, // default color
					{ text: result.afterValue, color: { r: 0, g: 1, b: 0 } } // green
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