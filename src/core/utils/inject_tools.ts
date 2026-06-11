
export function injectNewElements(
  appName: string,
  injectionId: string,
  parent: Element,
  onRegex: RegExp | string | null,
  onOrNextToText: 'on_text' | 'next_to_text',
  allowMultipleInjections: boolean,
  newElement: Element | ((parentElement: Element, text: string) => Element),
  updateExistingElement?: (element: Element, text: string) => boolean
): boolean {
  // Match the pattern in the text, use DOM Range to find and manipulate the matched text while preserving DOM structure
  const ranges = findTextRangeInElement(parent, onRegex);

  // No match found means the pattern was not in the element text. In this case we dont insert anything
  if (!ranges || ranges.length === 0) return false;

  let injected = false;
  for (const range of ranges) {
    injected = injectNewElementInRange(
      appName,
      // Add index to injectionId to allow multiple injections for the same link in the same element
      injectionId + '-' + ranges.indexOf(range),
      parent,
      range,
      onOrNextToText,
      newElement,
      updateExistingElement
    ) || injected;
    if (!allowMultipleInjections) break;
  }
  return injected;
}

function injectNewElementInRange(
  appName: string,
  injectionId: string,
  parent: Element,
  range: Range,
  onOrNextToText: 'on_text' | 'next_to_text',
  newElement: Element | ((parentElement: Element, text: string) => Element),
  updateExistingElement?: (element: Element, text: string) => boolean
): boolean {
  // Check if this injection is already present, if so, dont inject it again
  const injectionsInElement = parent.getElementsByClassName(appName + '-injection');
  for (const existingInjection of injectionsInElement) {
    if (existingInjection.classList.contains(appName + '-injection-' + injectionId)) {
      return updateExistingElement?.(existingInjection, getRangeText(range)) ?? false;
    }
  }

  // Add class to new element for future duplicate checks
  const newElem = typeof newElement === 'function' ? newElement(parent, getRangeText(range)) : newElement;
  newElem.classList.add(appName + '-injection', appName + '-injection-' + injectionId);

  if (onOrNextToText === 'on_text') {
    // Extract contents of range, wrap them in the new element, and insert back
    const contents = range.extractContents();
    newElem.appendChild(contents);
    range.insertNode(newElem);
    return true;
  } else if (onOrNextToText === 'next_to_text') {
    // Collapse range to its end and insert new element after
    range.collapse(false);
    range.insertNode(newElem);
    newElem.classList.add('skip-injection-text');
    return true;
  } else {
    console.error('Invalid onOrNextToText value: ' + onOrNextToText);
    return false;
  }
}

function getRangeText(range: Range): string {
  const rangeClone = range.cloneContents()
  rangeClone.querySelectorAll('.skip-injection-text').forEach(el => el.remove());
  return rangeClone.textContent || '';
}

function findTextRangeInElement(element: Element, regex: RegExp | string | null): Range[] | null {
  const elementRange = document.createRange();
  elementRange.selectNodeContents(element);

  if (!regex) {
    // If there is no regex provided, they must mean the whole element
    return [elementRange];
  }

  const regexExp = regex instanceof RegExp ? regex : new RegExp(regex, 'g');
  const matches = getRangeText(elementRange).matchAll(regexExp);

  if (!matches) return null;

  // Use DOM Range to find and manipulate the matched text while preserving DOM structure
  const ranges = Array.from(matches).map((m) => findTextOffsetRangeInElement(element, m.index, m[0].length));
  return ranges.filter((r): r is Range => r !== null);
}

function findTextOffsetRangeInElement(element: Element, startOffset: number, length: number): Range | null {
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
        // @ts-ignore
        if (('classList' in child) && child.classList.contains('skip-injection-text')) {
          // Skip nodes that are marked to be skipped (e.g. already injected elements)
          continue;
        }
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
