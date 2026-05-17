

export function injectNewElement(
  appName: string,
  elementId: string,
  parent: Element,
  onRegex: RegExp | string | null,
  onOrNextToText: 'on_text' | 'next_to_text',
  createNewElement: (parentElement: Element, text: string) => Element
) {
    // Check if this injection is already present, if so, dont inject it again
    const injectionsInElement = parent.getElementsByClassName(appName + '-injection');
    for (const existingInjection of injectionsInElement) {
      if (existingInjection.classList.contains(appName + '-injection-' + elementId)) {
        return;
      }
    }
  
    // Match the pattern in the text, use DOM Range to find and manipulate the matched text while preserving DOM structure
    const range = findTextRangeInElement(parent, onRegex);
  
    // No match found means the pattern was not in the element text. In this case we dont insert anything
    if (!range) return;

    // Add class to new element for future duplicate checks
    const newElem = createNewElement(parent, range.toString());
    newElem.classList.add(appName + '-injection', appName + '-injection-' + elementId);
  
    if (onOrNextToText === 'on_text') {
      // Extract contents of range, wrap them in the new element, and insert back
      const contents = range.extractContents();
      newElem.textContent = '';
      newElem.appendChild(contents);
      range.insertNode(newElem);
    } else if (onOrNextToText === 'next_to_text') {
      // Collapse range to its end and insert new element after
      range.collapse(false);
      range.insertNode(newElem);
    } else {
      console.error('Invalid onOrNextToText value: ' + onOrNextToText);
    }
}

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
