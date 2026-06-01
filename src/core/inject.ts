import { formatLinkDisplayName, formatLinkHref } from '@/core/replacer';
import { LinkWithConditions, UserSettings } from '@/core/types';
import linkemIconUrl from '~/assets/32.png';
import { linksStorage, settingsStorage } from './storage/local_storage';
import { injectNewElement } from './utils/inject_tools';
import { getFailingPostMatchConditions, getFailingPreMatchConditions } from './conditions';
import { getElementsByXPath } from './utils/xpath';


export async function checkInjectLinks() {
  let anyInjected = false;
  try {
    const allLinks = Object.values(await linksStorage.getValue());
    for (const link of allLinks) {
      if (getFailingPreMatchConditions(link).length === 0) {
        const inElements = getElementsByXPath(link.on_xpath);
        for (const inElem of inElements) {
          if (getFailingPostMatchConditions(link, inElem).length === 0) {
            const thisInjected = await applyLinkToElement(link, inElem);
            anyInjected = anyInjected || thisInjected;
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to inject links:', error);
  }
  return anyInjected;
}

export async function applyLinkToElement(link: LinkWithConditions, element: Element): Promise<boolean> {
  const position = link.position === 'user_default'
    ? (await settingsStorage.getItem<UserSettings['default_link_position']>('default_link_position'))
    : link.position;

  if (!position) {
    console.error('No position found for link', link, 'this should not be possible');
    return false;
  }

  const linkText = link.position === 'on_text' ? '' : formatLinkDisplayName(link);

  return injectNewElement(
    'linkem',
    link.id,
    element,
    link.on_selected_text_regex,
    position,
    (parentElement, text) => createNewLinkElement(formatLinkHref(link, text), linkText, parentElement),
    (existingElement, text) => {
      if (!('href' in existingElement)) throw new Error('Existing element is not a link, cannot update href');
      existingElement.href = formatLinkHref(link, text);
    }
  )
}

function createNewLinkElement(href: string, text: string, parentElement?: Element): HTMLAnchorElement {
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
