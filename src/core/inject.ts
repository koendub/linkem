import { formatLinkDisplayName, formatLinkHref } from '@/core/replacer';
import { LinkWithConditions, Condition } from '@/core/types';
import { LocalLinksStorage } from './storage/local_links_storage';
import { settingsStorage } from './storage/local_base_storage';
import { getElementByXPath } from './xpath';
import linkemIconUrl from '~/assets/32.png';

/////////////////////////////////////////////////////////// Checking link applicability

const preMatchConditions = {
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
  },
}

const postMatchConditions = {
  'text_contains': {
    check: (c: Condition, match: Element) => match.textContent.includes(c.value),
    explanation: (c: Condition, _: Element) => `The matched element did not contain text "${c.value}"`,
  }
}

export function getFailingPreMatchConditions(link: LinkWithConditions): Condition[] {
  return link.conditions.filter(c => c.type !in preMatchConditions || preMatchConditions[c.type as keyof typeof preMatchConditions]!.check(c));
}

export function getFailingPostMatchConditions(link: LinkWithConditions, matchedElement: Element): Condition[] {
  return link.conditions.filter(c => c.type !in postMatchConditions || postMatchConditions[c.type as keyof typeof postMatchConditions]!.check(c, matchedElement));
}

/////////////////////////////////////////////////////////// Inserting links into the page

export async function injectLinks() {
  try {
    const allLinks = await LocalLinksStorage.getAllLinks();
    await injectMatchingLinks(Object.values(allLinks));
  } catch (error) {
    console.error('Failed to inject links:', error);
  }
}

export async function injectMatchingLinks(links: LinkWithConditions[]): Promise<void> {
  for (const link of links) {
    if (getFailingPreMatchConditions(link).length === 0) {
      const inElement = getElementByXPath(link.on_xpath);
      if (inElement && getFailingPostMatchConditions(link, inElement).length === 0) {
        await applyLinkToElement(link, inElement);
      }
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
      const linkEl = createNewLinkElement(link.id, href, text, element);
      linkEl.textContent = '';
      while (element.firstChild) {
        linkEl.appendChild(element.firstChild);
      }
      element.appendChild(linkEl);
    } else if (position === 'next_to_text') {
      const linkEl = createNewLinkElement(link.id, href, formatLinkDisplayName(link), element);
      linkEl.style.marginLeft = '5px';
      element.appendChild(linkEl);
    }
    return;
  }

  // Match the pattern in the text
  const regex = new RegExp(pattern);
  const match = text.match(regex);

  if (!match) {
    // No match found, append the link at the end
    const linkEl = createNewLinkElement(link.id, href, formatLinkDisplayName(link), element);
    linkEl.style.marginLeft = '5px';
    element.appendChild(linkEl);
    return;
  }

  const matchedText = match[0];
  const matchIndex = match.index || 0;

  // Use DOM Range to find and manipulate the matched text while preserving DOM structure
  const range = findTextRangeInElement(element, matchIndex, matchedText.length);
  
  if (!range) {
    // Fallback: append at the end if range not found
    const linkEl = createNewLinkElement(link.id, href, formatLinkDisplayName(link), element);
    linkEl.style.marginLeft = '5px';
    element.appendChild(linkEl);
    return;
  }

  if (position === 'on_text') {
    // Extract contents of range, wrap in link, and insert back
    const contents = range.extractContents();
    const linkEl = createNewLinkElement(link.id, href, '', element);
    linkEl.textContent = '';
    linkEl.appendChild(contents);
    range.insertNode(linkEl);
  } else if (position === 'next_to_text') {
    // Collapse range to its end and insert link after
    const linkEl = createNewLinkElement(link.id, href, formatLinkDisplayName(link), element);
    linkEl.style.marginLeft = '5px';
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

function createNewLinkElement(linkId: string, href: string, text: string, parentElement?: Element): HTMLAnchorElement {
  // Determine the rought size
  let fontSize = 14;
  if (parentElement) {
    const parentStyle = window.getComputedStyle(parentElement);
    const parentFontSize = parseFloat(parentStyle.fontSize);
    fontSize = Math.min(Math.max(parentFontSize, 12), 20);
  }

  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.style.color = '#000000';
  a.style.backgroundColor = '#a78bfa';
  a.style.padding = `${Math.floor((fontSize-10)/2)}px ${Math.floor(fontSize/2)}px`;
  a.style.textDecoration = 'none';
  a.style.borderRadius = '5px';
  a.style.alignItems = 'center';
  a.style.display = 'inline-block';
  a.style.gap = '4px';
  a.style.fontSize = fontSize + 'px';
  a.style.lineHeight = fontSize + 'px';
  a.classList.add('linkem-injected-link');
  a.classList.add('link-' + linkId);
  if (fontSize > 16) a.style.margin = '2px';

  // Add icon
  const icon = document.createElement('img');
  icon.src = linkemIconUrl;
  icon.style.width = `${fontSize}px`;
  icon.style.height = `${fontSize}px`;
  icon.style.marginRight = `5px`;
  icon.style.display = 'inline-block';
  icon.style.flexShrink = '0';
  a.appendChild(icon);

  // Add text
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  a.appendChild(textSpan);
  return a;
}
