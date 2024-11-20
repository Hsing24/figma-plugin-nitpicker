// 顯示 UI 窗口
figma.showUI(__html__, { width: 300, height: 400 });

// 接收來自 UI 的消息
figma.ui.onmessage = (msg) => {
	if (msg.type === 'getStyles') {
		// 獲取選取的 frame
		const selection = figma.currentPage.selection;
		if (selection.length === 2 &&
			selection[0].type === 'FRAME' &&
			selection[1].type === 'FRAME') {
			const frame1 = selection[0];
			const frame2 = selection[1];
			// 獲取 frame 的 CSS 樣式
			const cssStyles1 = getCSSStyles(frame1);
			const cssStyles2 = getCSSStyles(frame2);
			// 發送樣式信息到 UI
			figma.ui.postMessage({
				type: 'showStyles',
				styles1: cssStyles1,
				styles2: cssStyles2
			});
		} else {
			// 如果没有选中 frame 或选中多个对象，提示用户
			figma.notify('請選擇兩個 frame');
		}
	}
};

// 獲取 frame 的 CSS 樣式 (待補充)
function getCSSStyles(frame) {
	// 這裡需要根據 Figma API 獲取 frame 的各種樣式屬性，
	// 例如：寬度、高度、背景顏色、邊框、字體等等。
	// 並將這些樣式屬性转换成 CSS 樣式字符串。

	// 以下是一個簡單的示例，僅獲取 frame 的寬度和高度：
	const width = frame.width;
	const height = frame.height;
	const cssStyles = `width: ${width}px; height: ${height}px;`;

	// ... (獲取其他樣式屬性並转换成 CSS 樣式字符串)

	return cssStyles;
}