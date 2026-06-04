import { formatLinkDisplayName, formatLinkHref } from '@/core/replacer';
import { LinkWithConditions, UserSettings } from '@/core/types';
import linkIcon from '~/assets/link-icon.svg?raw';
import { linksStorage, settingsStorage } from './storage/local_storage';
import { injectNewElement } from './utils/inject_tools';
import { getFailingPostMatchConditions, getFailingPreMatchConditions } from './conditions';
import { getElementsByXPath } from './utils/xpath';
import { RgbaColor } from 'react-colorful';


export const DEFAULT_LINK_COLOR = '#88a6ff';

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
    (parentElement, text) => createNewLinkElement(link, formatLinkHref(link, text), linkText, parentElement),
    (existingElement, text) => {
      if (!('href' in existingElement)) throw new Error('Existing element is not a link, cannot update href');
      existingElement.href = formatLinkHref(link, text);
    }
  )
}

// See http://www.w3.org/TR/AERT#color-contrast
const getBrightness = ({ r, g, b }: RgbaColor) => (r * 299 + g * 587 + b * 114) / 1000;

const round = (number: number, digits = 0, base = Math.pow(10, digits)): number => {
  return Math.round(base * number) / base;
};

// https://github.com/omgovich/react-colorful/blob/master/src/utils/convert.ts
const hexToRgba = (hex: string): RgbaColor => {
  if (hex[0] === "#") hex = hex.substring(1);
  if (hex.length < 6) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
      a: hex.length === 4 ? round(parseInt(hex[3] + hex[3], 16) / 255, 2) : 1,
    };
  }
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
    a: hex.length === 8 ? round(parseInt(hex.substring(6, 8), 16) / 255, 2) : 1,
  };
};

const getTextColorForBackground = (bgColor: RgbaColor) => getBrightness(bgColor) > 128 || bgColor.a < 0.5 ? "#111" : "#eee";

const getTextColorForBackgroundHex = (bgColorHex: string) => getTextColorForBackground(hexToRgba(bgColorHex));


function createNewLinkElement(link: LinkWithConditions, href: string, text: string, parentElement?: Element): HTMLAnchorElement {
  // Determine the rought size
  let fontSize = 14;
  if (parentElement) {
    const parentStyle = window.getComputedStyle(parentElement);
    const parentFontSize = parseFloat(parentStyle.fontSize);
    fontSize = Math.min(Math.max(parentFontSize, 12), 20);
  }

  const bgColor = link.color || DEFAULT_LINK_COLOR;
  const textColor = getTextColorForBackgroundHex(bgColor);

  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.style.backgroundColor = bgColor;
  a.style.color = textColor;
  a.style.padding = `${Math.floor((fontSize-10)/2)}px ${Math.floor(fontSize/2)}px`;
  a.style.textDecoration = 'none';
  a.style.borderRadius = '5px';
  a.style.alignItems = 'center';
  a.style.display = 'inline-block';
  a.style.gap = '4px';
  a.style.fontSize = fontSize + 'px';
  a.style.lineHeight = fontSize + 'px';
  a.style.margin = `0px ${Math.floor((fontSize-5)/2)}px`;
  if (fontSize > 18) {
    a.style.verticalAlign = '6px';
  }

  // Add icon
  const icon = document.createElement('div');
  icon.innerHTML = linkIcon;
  icon.style.color = textColor;
  icon.style.stroke = textColor;
  icon.style.fill = textColor;
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
