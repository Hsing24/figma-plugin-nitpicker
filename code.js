figma.showUI(__html__, { width: 300, height: 400 });

figma.ui.onmessage = (msg) => {
	if (msg.type === 'getStyles') {
		const selection = figma.currentPage.selection;
		console.log("🚀 -------------------------🚀")
		console.log("🚀 ~ selection:", selection)
		console.log("🚀 -------------------------🚀")
		if (selection.length === 2) {
			const frame1 = selection[0];
			const frame2 = selection[1];
			const cssStyles1 = getAllNodeStyles(frame1);
			const cssStyles2 = getAllNodeStyles(frame2);
			console.log('Frame 1 Styles:', cssStyles1);
			console.log('Frame 2 Styles:', cssStyles2);
		} else {
			figma.notify('請選擇兩個 frame');
		}
	}
};



function getCSSStyles(node) {
	console.log("🚀 ---------------🚀")
	console.log("🚀 ~ node:", node)
	console.log("🚀 ~ node keys:", Object.keys(node))
	console.log("🚀 ---------------🚀")
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

	const margin = node.layoutPositioning === 'AUTO' ? `${node.layoutGrow * 100}%` : '0px';
	const padding = node.paddingLeft !== undefined ? `${node.paddingLeft}px ${node.paddingTop}px ${node.paddingRight}px ${node.paddingBottom}px` : '0px';

	const border = node.strokes && node.strokes.length > 0 ? node.strokes.map(stroke => {
		const strokeColor = `rgba(${Math.round(stroke.color.r * 255)}, ${Math.round(stroke.color.g * 255)}, ${Math.round(stroke.color.b * 255)}, ${stroke.color.a ? stroke.color.a : 1})`;
		return `${node.strokeWeight}px solid ${strokeColor}`;
	}).join(', ') : 'none';

	const color = node.fills && node.fills.length > 0 ? node.fills.map(fill => {
		const fillColor = `rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${fill.color.a ? fill.color.a : 1})`;
		return fillColor;
	}).join(', ') : 'none';

	const font = node.fontName ? `${node.fontSize}px ${node.fontName.family}` : 'inherit';
	const textAlign = node.textAlignHorizontal ? node.textAlignHorizontal.toLowerCase() : 'left';

	const position = node.relativeTransform ? 'absolute' : 'relative';
	const translate = node.relativeTransform ? `${node.relativeTransform[0][2]}px ${node.relativeTransform[1][2]}px` : 'none';
	const rotate = node.rotation ? `${node.rotation}deg` : 'none';

	const cssStyles = {
		width: `${width}px`,
		height: `${height}px`,
		backgroundColor: fillColor,
		opacity: opacity,
		borderRadius: borderRadius,
		boxShadow: boxShadow,
		margin: margin,
		padding: padding,
		border: border,
		color: color,
		font: font,
		textAlign: textAlign,
		position: position,
		translate: translate,
		rotate: rotate,
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