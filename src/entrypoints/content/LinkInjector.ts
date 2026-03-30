import { formatLinkHref } from '@/utils/href';
import { CustomLink, LinkCondition } from '../../models';

export class LinkInjector {
  static async injectLinks(links: CustomLink[]): Promise<void> {
    for (const link of links) {
      if (link.conditions.every(this.checkCondition)) {
        console.log("Conditions passed! Injecting link!")
        await this.injectLink(link);
      }
    };
  }

  private static checkCondition(condition: LinkCondition): boolean {
    console.log("Checking condition", condition.type);
    switch (condition.type) {
      case 'url_start':
        console.log("Condition: does", window.location.href, "start with", condition.value);
        return window.location.href.startsWith(condition.value);
      case 'url_contains':
        return window.location.href.includes(condition.value);
      case 'xpath_exists':
        console.log("Condition: xpath", condition.value, "is present")
        return !!document.evaluate(condition.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      case 'value_match':
        return document.body.textContent?.includes(condition.value) || false;
      default:
        return false;
    }
  }

  private static async injectLink(link: CustomLink): Promise<void> {
    // Get the element to inject the link into
    const inElement = document.evaluate(
      link.location.onXPath,
      document,
      null, XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as Element;
    if (!inElement || inElement.hasAttribute('data-linkem-injected')) return;
    await this.applyLinkToElement(link, inElement);
    inElement.setAttribute('data-linkem-injected', 'true');
  }

  private static createLinkElement(href: string, text: string, marginLeft?: boolean): HTMLAnchorElement {
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

  private static async applyLinkToElement(link: CustomLink, element: Element): Promise<void> {
    const text = element.textContent || '';
    const href = formatLinkHref(link, text);

    const position = link.location.position === 'user_default'
      ? (await SettingsStorage.getSettings()).defaultLinkPosition
      : link.location.position;

    const pattern = link.location.onSelectedTextRegex;

    // If no pattern is provided, use the full text
    if (!pattern) {
      if (position === 'on_text') {
        element.textContent = '';
        element.appendChild(this.createLinkElement(href, text));
      } else if (position === 'next_to_text') {
        element.appendChild(this.createLinkElement(href, link.location.displayName || link.name, true));
      }
      return;
    }

    // Match the pattern in the text
    const regex = new RegExp(pattern);
    const match = text.match(regex);

    if (!match) {
      // No match found, append the link at the end
      element.appendChild(this.createLinkElement(href, link.location.displayName || link.name, true));
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
      element.appendChild(this.createLinkElement(href, matchedText));
    } else if (position === 'next_to_text') {
      // Add the matched text as regular text
      element.appendChild(document.createTextNode(matchedText));

      // Add the link after the matched text
      element.appendChild(this.createLinkElement(href, link.location.displayName || link.name, true));
    }

    // Add the remaining unrelated text after the match
    const endIndex = matchIndex + matchedText.length;
    if (endIndex < text.length) {
      element.appendChild(document.createTextNode(text.substring(endIndex)));
    }
  }
}