import { formatLinkDisplayName, formatLinkHref } from '@/core/replacer';
import { LinkWithConditions } from '@/core/types';
import linkemIconUrl from '~/assets/32.png';
import { settingsStorage } from './storage/local_storage';
import { findTextRangeInElement } from './utils/inject_tools';


export async function applyLinkToElement(link: LinkWithConditions, element: Element): Promise<void> {
  const position = link.position === 'user_default'
    ? (await settingsStorage.getItem<string>('default_link_position'))
    : link.position;

  // Check if the link is already injected in this element, if so, dont inject it again
  const searchIn = element.parentElement || element;
  const linksInElement = searchIn.getElementsByClassName('linkem-injected-link');
  for (const existingLink of linksInElement) {
    if (existingLink.classList.contains('link-' + link.id)) {
      return;
    }
  }

  const text = element.textContent || '';
  const href = formatLinkHref(link, text);

  // Match the pattern in the text, use DOM Range to find and manipulate the matched text while preserving DOM structure
  const range = findTextRangeInElement(element, link.on_selected_text_regex);

  // No match found means the pattern was not in the element text. In this case we dont insert anything
  if (!range) return;

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
  a.style.backgroundColor = '#b69dff';
  a.style.padding = `${Math.floor((fontSize-10)/2)}px ${Math.floor(fontSize/2)}px ${Math.floor((fontSize-14)/2)}px ${Math.floor(fontSize/2)}px`;
  a.style.textDecoration = 'none';
  a.style.borderRadius = '5px';
  a.style.alignItems = 'center';
  a.style.display = 'inline-block';
  a.style.gap = '4px';
  a.style.fontSize = fontSize + 'px';
  a.style.lineHeight = fontSize + 'px';
  a.classList.add('linkem-injected-link');
  a.classList.add('link-' + linkId);
  if (fontSize > 18) {
    a.style.verticalAlign = '6px';
  }

  // Add icon
  const icon = document.createElement('img');
  icon.src = linkemIconUrl;
  icon.style.width = `${fontSize - 4}px`;
  icon.style.height = `${fontSize - 4}px`;
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
