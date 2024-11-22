// 執行 plugin 的主要函式
figma.on("run", ({ parameters, command }) => {
	// 1. 取得選取的兩個區塊
	const selections = figma.currentPage.selection;
	if (selections.length !== 2) {
		figma.notify("請選擇兩個區塊");
		figma.closePlugin();
		return;
	}
	const nodeA = selections[0];
	const nodeB = selections[1];

	// 2. 比對 CSS 樣式
	const diff = compareStyles(nodeA, nodeB);

	// 3. 建立文字區塊並顯示比對結果
	const resultNode = figma.createText();
	resultNode.characters = formatDiff(diff);
	figma.currentPage.appendChild(resultNode);

	// 完成 plugin 執行
	figma.closePlugin();
});

// 比對兩個節點的樣式
function compareStyles(nodeA, nodeB) {
	const stylesA = getComputedStyles(nodeA);
	const stylesB = getComputedStyles(nodeB);
	const diff = {};

	// 比對樣式差異
	for (const property in stylesA) {
		if (stylesA[property] !== stylesB[property]) {
			diff[property] = {
				A: stylesA[property],
				B: stylesB[property],
			};
		}
	}

	return diff;
}

function getComputedStyles(node) {
	const styles = {};

	// 取得節點的樣式屬性
	const nodeStyle = node.getPluginData('sharedStyle');
	if (nodeStyle) {
		const sharedStyle = JSON.parse(nodeStyle);
		// 從 sharedStyle 中提取樣式屬性
		styles.fontFamily = sharedStyle.fontFamily;
		styles.fontSize = sharedStyle.fontSize;
		styles.fontWeight = sharedStyle.fontWeight;
		// ... 其他樣式屬性
	} else {
		// 如果節點沒有 sharedStyle，則直接從節點屬性中提取
		styles.fontFamily = node.fontName.family;
		styles.fontSize = node.fontSize;
		styles.fontWeight = node.fontName.style;
		// ... 其他樣式屬性
	}

	// 取得節點的顏色
	const fills = node.fills;
	if (fills && fills.length > 0 && fills[0].type === 'SOLID') {
		const fill = fills[0];
		styles.color = `rgba(${fill.color.r}, ${fill.color.g}, ${fill.color.b}, ${fill.opacity})`;
	}

	// 取得節點的尺寸和位置
	styles.width = node.width;
	styles.height = node.height;
	styles.x = node.x;
	styles.y = node.y;

	// ... 其他樣式屬性，例如：
	//   - letterSpacing
	//   - lineHeight
	//   - textAlign
	//   - textDecoration
	//   - padding
	//   - margin
	//   - border
	//   - opacity
	//   - ...

	return styles;
}

// 格式化比對結果
function formatDiff(diff) {
	let result = "";
	for (const property in diff) {
		result += `${property}:\n`;
		result += `  A: ${diff[property].A}\n`;
		result += `  B: ${diff[property].B}\n`;
	}
	return result;
}