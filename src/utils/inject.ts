import { formatLinkHref } from '@/utils/href';
import { LinkWithConditions, Condition } from '@/types/supabase';
import { LocalSettingsStorage } from '@/utils/storage/local_settings_storage';


export async function injectLink(link: LinkWithConditions): Promise<void> {
  if (!link.conditions.every(checkCondition)) return;
  const inElement = getElementByXPath(link.on_xpath);
  if (!inElement || inElement.hasAttribute('data-linkem-injected')) return;
  await applyLinkToElement(link, inElement);
  inElement.setAttribute('data-linkem-injected', 'true');
}

/////////////////////////////////////////////////////////// Helper functions

function checkCondition(condition: Condition): boolean {
  switch (condition.type) {
    case 'url_start':
      return window.location.href.startsWith(condition.value);
    case 'url_contains':
      return window.location.href.includes(condition.value);
    case 'xpath_exists':
      return !!getElementByXPath(condition.value);
    case 'value_match':
      return document.body.textContent?.includes(condition.value) || false;
    default:
      return false;
  }
}

function createLinkElement(href: string, text: string, marginLeft?: boolean): HTMLAnchorElement {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  a.target = '_blank';
  a.style.color = '#5607f5';
  if (marginLeft) {
    a.style.marginLeft = '5px';
  }
  return a;
}

async function applyLinkToElement(link: LinkWithConditions, element: Element): Promise<void> {
  const text = element.textContent || '';
  const href = formatLinkHref(link, text);

  const position = link.position === 'user_default'
    ? (await LocalSettingsStorage.getSettings()).default_link_position
    : link.position;

  const pattern = link.on_selected_text_regex;

  // If no pattern is provided, use the full text
  if (!pattern) {
    if (position === 'on_text') {
      element.textContent = '';
      element.appendChild(createLinkElement(href, text));
    } else if (position === 'next_to_text') {
      element.appendChild(createLinkElement(href, link.display_name || link.name, true));
    }
    return;
  }

  // Match the pattern in the text
  const regex = new RegExp(pattern);
  const match = text.match(regex);

  if (!match) {
    // No match found, append the link at the end
    element.appendChild(createLinkElement(href, link.display_name || link.name, true));
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
    element.appendChild(createLinkElement(href, matchedText));
  } else if (position === 'next_to_text') {
    // Add the matched text as regular text
    element.appendChild(document.createTextNode(matchedText));

    // Add the link after the matched text
    element.appendChild(createLinkElement(href, link.display_name || link.name, true));
  }

  // Add the remaining unrelated text after the match
  const endIndex = matchIndex + matchedText.length;
  if (endIndex < text.length) {
    element.appendChild(document.createTextNode(text.substring(endIndex)));
  }
}
