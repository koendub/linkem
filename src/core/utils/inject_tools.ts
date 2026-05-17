

export function findTextRangeInElement(element: Element, regex: RegExp | string | null): Range | null {
  if (!regex) {
    // If there is no regex provided, they must mean the whole element
    const nodeRange = document.createRange();
    nodeRange.selectNodeContents(element);
    return nodeRange;
  }

  const regexExp = regex instanceof RegExp ? regex : new RegExp(regex);
  const match = (element.textContent || '').match(regexExp);

  if (!match) return null;

  // Use DOM Range to find and manipulate the matched text while preserving DOM structure
  return findTextOffsetRangeInElement(element, match.index || 0, match[0].length);
}

export function findTextOffsetRangeInElement(element: Element, startOffset: number, length: number): Range | null {
  let charCount = 0;
  let startNode: Node | null = null;
  let startNodeOffset = 0;
  let endNode: Node | null = null;
  let endNodeOffset = 0;
  
  function walkNodes(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.textContent || '';
      const nodeEnd = charCount + nodeText.length;
      
      // Check if match start is in this node
      if (charCount <= startOffset && startOffset < nodeEnd && !startNode) {
        startNode = node;
        startNodeOffset = startOffset - charCount;
      }
      
      // Check if match end is in this node
      if (charCount <= startOffset + length && startOffset + length <= nodeEnd && startNode) {
        endNode = node;
        endNodeOffset = (startOffset + length) - charCount;
        return true; // Found both start and end
      }
      
      charCount = nodeEnd;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (const child of node.childNodes) {
        if (walkNodes(child)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  walkNodes(element);
  
  if (!startNode || !endNode) {
    return null;
  }
  
  const range = document.createRange();
  range.setStart(startNode, startNodeOffset);
  range.setEnd(endNode, endNodeOffset);
  return range;
}
