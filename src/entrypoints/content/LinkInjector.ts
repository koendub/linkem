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

  private static async applyLinkToElement(link: CustomLink, element: Element): Promise<void> {
    const text = element.textContent || '';
    const href = formatLinkHref(link, text);

    const position = link.location.position === 'user_default'
      ? (await SettingsStorage.getSettings()).defaultLinkPosition
      : link.location.position;

    if (position === 'on_text') {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      a.target = '_blank';
      element.textContent = '';
      element.appendChild(a);
    } else if (position === 'next_to_text') {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = link.location.displayName || link.name;
      a.target = '_blank';
      a.style.marginLeft = '5px';
      element.appendChild(a);
    }
  }
}