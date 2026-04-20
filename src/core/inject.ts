import { formatLinkHref } from '@/core/href';
import { LinkWithConditions, Condition } from '@/core/types';
import { LocalLinksStorage } from './storage/local_links_storage';
import { settingsStorage } from './storage/local_base_storage';
import { getElementByXPath } from './xpath';


/////////////////////////////////////////////////////////// Checking link applicability

const conditionDetails = {
  'url_start': {
    check: (c: Condition) => window.location.href.startsWith(c.value),
    explanation: (c: Condition) => `URL does not start with "${c.value}".`
  },
  'url_contains': {
    check: (c: Condition) => window.location.href.includes(c.value),
    explanation: (c: Condition) => `URL does not contain "${c.value}".`
  },
  'xpath_exists': {
    check: (c: Condition) => !!getElementByXPath(c.value),
    explanation: (c: Condition) => `No element matches the XPath "${c.value}".`
  },
  'value_match': {
    check: (c: Condition) => document.body.textContent?.includes(c.value) || false,
    explanation: (c: Condition) => `The page does not contain the text "${c.value}".`
  }
}

export async function injectLinks() {
  try {
    const allLinks = await LocalLinksStorage.getAllLinks();
    await injectMatchingLinks(Object.values(allLinks));
  } catch (error) {
    console.error('Failed to inject links:', error);
  }
}

export function getFailingConditions(conditions: Condition[]): string[] {
  const failing = conditions.filter(c => !conditionDetails[c.type]!.check(c));
  return failing.map(c => conditionDetails[c.type]!.explanation(c));
}

/////////////////////////////////////////////////////////// Inserting links into the page

export async function injectMatchingLinks(links: LinkWithConditions[]): Promise<void> {
  for (const link of links) {
    if (link.conditions.every(c => conditionDetails[c.type]!.check(c))) {
      const inElement = getElementByXPath(link.on_xpath);
      if (inElement) await applyLinkToElement(link, inElement);
    }
  }
}

async function applyLinkToElement(link: LinkWithConditions, element: Element): Promise<void> {
  const position = link.position === 'user_default'
    ? (await settingsStorage.getItem<string>('default_link_position'))
    : link.position;

  // Check if the link is already injected in this element, if so, dont inject it again
  const linksInElement = element.getElementsByClassName('linkem-injected-link');
  for (const existingLink of linksInElement) {
    if (existingLink.classList.contains('link-' + link.id)) {
      return;
    }
  }

  const text = element.textContent || '';
  const href = formatLinkHref(link, text);
  const pattern = link.on_selected_text_regex;

  // If no pattern is provided, use the full text
  if (!pattern) {
    if (position === 'on_text') {
      // Wrap all element contents in a link, preserving DOM structure
      const linkEl = createNewLinkElement(link.id, href, text);
      linkEl.textContent = '';
      while (element.firstChild) {
        linkEl.appendChild(element.firstChild);
      }
      element.appendChild(linkEl);
    } else if (position === 'next_to_text') {
      element.appendChild(createNewLinkElement(link.id, href, link.display_name || link.name, true));
    }
    return;
  }

  // Match the pattern in the text
  const regex = new RegExp(pattern);
  const match = text.match(regex);

  if (!match) {
    // No match found, append the link at the end
    element.appendChild(createNewLinkElement(link.id, href, link.display_name || link.name, true));
    return;
  }

  const matchedText = match[0];
  const matchIndex = match.index || 0;

  // Use DOM Range to find and manipulate the matched text while preserving DOM structure
  const range = findTextRangeInElement(element, matchIndex, matchedText.length);
  
  if (!range) {
    // Fallback: append at the end if range not found
    element.appendChild(createNewLinkElement(link.id, href, link.display_name || link.name, true));
    return;
  }

  if (position === 'on_text') {
    // Extract contents of range, wrap in link, and insert back
    const contents = range.extractContents();
    const linkEl = createNewLinkElement(link.id, href, '');
    linkEl.textContent = '';
    linkEl.appendChild(contents);
    range.insertNode(linkEl);
  } else if (position === 'next_to_text') {
    // Collapse range to its end and insert link after
    const linkEl = createNewLinkElement(link.id, href, link.display_name || link.name, true);
    range.collapse(false);
    range.insertNode(linkEl);
  }
}

function findTextRangeInElement(element: Element, startOffset: number, length: number): Range | null {
  const range = document.createRange();
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
  
  range.setStart(startNode, startNodeOffset);
  range.setEnd(endNode, endNodeOffset);
  
  return range;
}

function createNewLinkElement(linkId: string, href: string, text: string, marginLeft?: boolean): HTMLAnchorElement {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  a.target = '_blank';
  a.style.color = '#5607f5';
  a.classList.add('linkem-injected-link');
  a.classList.add('link-' + linkId);
  if (marginLeft) {
    a.style.marginLeft = '5px';
  }
  return a;
}
