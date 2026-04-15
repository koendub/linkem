
export function getXPath(element: Element): string {
  if (element === document.body) return '/html/body';
  let path: string[] = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element === document.body) {
      selector = '/html/body';
      break;
    } else if (element.id) {
      selector = `/${selector}[@id="${element.id}"]`;
      path.unshift(selector);
      break;
    } else {
      let sibling = element.previousSibling;
      let nth = 1;
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName.toLowerCase() === selector) {
          nth++;
        }
        sibling = sibling.previousSibling;
      }
      selector += `[${nth}]`;
      path.unshift(selector);
      element = element.parentNode as Element;
    }
  }
  return path.length ? '/' + path.join('/') : '';
}

export function getElementByXPath(xpath: string): Element | null {
  return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as Element
}

export function moveXPathUp(xpath: string, element?: Element): [string, Element | null] {
  const newXPathViaSplit = xpath.split('/').slice(0, -1).join('/');
  const newElement = getElementByXPath(newXPathViaSplit);
  if (element) {
    // We just also quickly check for consistency
    const newXPathViaElement = getXPath(element.parentElement!);
    if (newXPathViaElement !== newXPathViaSplit) {
      console.warn('Moving up in XPath resulted in inconsistent XPaths!');
    }
    if (newElement !== element.parentElement) {
      console.warn('Moving up in XPath resulted in inconsistent elements!')
    }
  }
  return [newXPathViaSplit, newElement];
}
