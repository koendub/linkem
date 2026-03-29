
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
