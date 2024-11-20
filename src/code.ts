interface StyleObject {
  [key: string]: any;
}

interface MessageData {
  type: string;
  frame1: {
    name: string;
    styles: StyleObject;
  };
  frame2: {
    name: string;
    styles: StyleObject;
  };
  differences: StyleObject;
}

figma.showUI(__html__);

function getNodeStyles(node: FrameNode): StyleObject {
  const styles: StyleObject = {
    // Layout
    width: node.width,
    height: node.height,
    x: node.x,
    y: node.y,
    rotation: node.rotation,
    layoutMode: node.layoutMode,
    primaryAxisSizingMode: node.primaryAxisSizingMode,
    counterAxisSizingMode: node.counterAxisSizingMode,
    primaryAxisAlignItems: node.primaryAxisAlignItems,
    counterAxisAlignItems: node.counterAxisAlignItems,
    paddingTop: node.paddingTop,
    paddingRight: node.paddingRight,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    itemSpacing: node.itemSpacing,
    
    // Appearance
    opacity: node.opacity,
    blendMode: node.blendMode,
    isMask: node.isMask,
    effects: node.effects,
    effectStyleId: node.effectStyleId,
    
    // Fill & Stroke
    fills: node.fills,
    fillStyleId: node.fillStyleId,
    strokes: node.strokes,
    strokeStyleId: node.strokeStyleId,
    strokeWeight: node.strokeWeight,
    strokeAlign: node.strokeAlign,
    strokeCap: node.strokeCap,
    strokeJoin: node.strokeJoin,
    dashPattern: node.dashPattern,
    
    // Corner
    cornerRadius: node.cornerRadius,
    topLeftRadius: node.topLeftRadius,
    topRightRadius: node.topRightRadius,
    bottomRightRadius: node.bottomRightRadius,
    bottomLeftRadius: node.bottomLeftRadius,
    
    // Constraints
    constraints: node.constraints,
    layoutAlign: node.layoutAlign,
    layoutGrow: node.layoutGrow,
  };

  // Remove undefined properties
  Object.keys(styles).forEach(key => {
    if (styles[key] === undefined) {
      delete styles[key];
    }
  });

  return styles;
}

function compareStyles(style1: StyleObject, style2: StyleObject): StyleObject {
  const differences: StyleObject = {};
  const allKeys = new Set([...Object.keys(style1), ...Object.keys(style2)]);

  allKeys.forEach(key => {
    const val1 = style1[key];
    const val2 = style2[key];

    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      differences[key] = {
        frame1: val1,
        frame2: val2
      };
    }
  });

  return differences;
}

figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 2 && 
      selection[0].type === 'FRAME' && 
      selection[1].type === 'FRAME') {
    
    const frame1Styles = getNodeStyles(selection[0] as FrameNode);
    const frame2Styles = getNodeStyles(selection[1] as FrameNode);
    
    // Log styles for debugging
    console.log('Frame 1 styles:', frame1Styles);
    console.log('Frame 2 styles:', frame2Styles);
    
    // Compare styles
    const styleDifferences = compareStyles(frame1Styles, frame2Styles);
    console.log('Style differences:', styleDifferences);
    
    // Send results to UI
    figma.ui.postMessage({
      type: 'style-comparison',
      frame1: {
        name: selection[0].name,
        styles: frame1Styles
      },
      frame2: {
        name: selection[1].name,
        styles: frame2Styles
      },
      differences: styleDifferences
    } as MessageData);
  }
});

// Set a default size for the UI
figma.ui.resize(400, 600);