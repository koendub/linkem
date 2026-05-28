
export function getXPath(element: Element, useIds: boolean): string {
  if (element === document.body) return '/html/body';
  let path: string[] = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element === document.body) {
      selector = '/html/body';
      break;
    } else if (element.id && useIds) {
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

export function getElementsByXPath(xpath: string): Element[] {
  let results = [];
  let query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
      results.push(query.snapshotItem(i) as Element);
  }
  return results;
}

export function moveXPathUp(xpath: string, element?: Element): [string, Element | null] {
  const newXPathViaSplit = xpath.split('/').slice(0, -1).join('/');
  const newElement = getElementByXPath(newXPathViaSplit);
  if (element) {
    // We just also quickly check for consistency
    const newXPathViaElement = getXPath(element.parentElement!, false);
    if (newXPathViaElement !== newXPathViaSplit) {
      console.warn('Moving up in XPath resulted in inconsistent XPaths!');
    }
    if (newElement !== element.parentElement) {
      console.warn('Moving up in XPath resulted in inconsistent elements!')
    }
  }
  return [newXPathViaSplit, newElement];
}

export function findMoreGeneralXPath(initialXPath: string): { newXPath: string, matchCount: number } | undefined {
  const count = (xp: string) => {
    try {
      return document.evaluate(xp, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
    } catch {
      return 0;
    }
  }
  let bestXpath = null;
  let mostMatches = count(initialXPath);
  for (const match of [...initialXPath.matchAll(/[0-9]+/g)].reverse()) {
    // For each number in the xpath, replace it with a * to make it more general.
    const preMatch = initialXPath.substring(0, match.index);
    const postMatch = initialXPath.substring(match.index + match[0].length);
    const starXpath = preMatch + '*' + postMatch;
    // Then check how many elements are found with that new xpath.
    const nodesWithStarXpath = count(starXpath);
    console.log(`Found ${nodesWithStarXpath} with xpath "${starXpath}"`)
    if (nodesWithStarXpath > mostMatches) {
      bestXpath = starXpath;
      mostMatches = nodesWithStarXpath;
    }
  }
  if (!bestXpath) return undefined;
  // Keep the xpath that has the most elements found, but only has a single * more than the initial XPath.
  return { newXPath: bestXpath, matchCount: mostMatches };
}
