import { formatLinkHref } from '@/utils/href';
import { LinkWithConditions, Condition } from '@/types';
import { LocalLinksStorage } from './storage/local_links_storage';
import { settingsStorage } from './storage/local_base_storage';


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
  // Check if the link is already injected in this element, if so, dont inject it again
  const linksInElement = element.getElementsByClassName('linkem-injected-link');
  for (const existingLink of linksInElement) {
    if (existingLink.classList.contains('link-' + link.id)) {
      return;
    }
  }

  

  const position = link.position === 'user_default'
    ? (await settingsStorage.getItem<string>('default_link_position'))
    : link.position;
  
  const text = element.textContent || '';
  const href = formatLinkHref(link, text);
  const pattern = link.on_selected_text_regex;

  // If no pattern is provided, use the full text
  if (!pattern) {
    if (position === 'on_text') {
      element.textContent = '';
      element.appendChild(createNewLinkElement(link.id, href, text));
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

  // Clear the element and rebuild it
  element.textContent = '';

  // Add text before the match
  if (matchIndex > 0) {
    element.appendChild(document.createTextNode(text.substring(0, matchIndex)));
  }

  if (position === 'on_text') {
    // Wrap the matched text in a link
    element.appendChild(createNewLinkElement(link.id, href, matchedText));
  } else if (position === 'next_to_text') {
    // Add the matched text as regular text, then add the link after it
    element.appendChild(document.createTextNode(matchedText));
    element.appendChild(createNewLinkElement(link.id, href, link.display_name || link.name, true));
  }

  // Add the remaining unrelated text after the match
  const endIndex = matchIndex + matchedText.length;
  if (endIndex < text.length) {
    element.appendChild(document.createTextNode(text.substring(endIndex)));
  }
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
