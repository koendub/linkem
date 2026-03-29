import { formatLinkHref } from '@/utils/href';
import { CustomLink, LinkCondition } from '../../models';

export class LinkInjector {
  static injectLinks(links: CustomLink[]): void {
    links.forEach(link => {
      if (link.conditions.every(this.checkCondition)) {
        console.log("Conditions passed! Injecting link!")
        this.injectLink(link);
      }
    });
  }

  private static checkCondition(condition: LinkCondition): boolean {
    console.log("Checking condition", condition.type);
    switch (condition.type) {
      case 'url_start':
        console.log("Condition: does", window.location.href, "start with", condition.value);
        return window.location.href.startsWith(condition.value);
      case 'url_contains':
        return window.location.href.includes(condition.value);
      case 'xpath_match':
        console.log("Condition: xpath", condition.value, "is present")
        return !!document.evaluate(condition.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      case 'value_match':
        return document.body.textContent?.includes(condition.value) || false;
      default:
        return false;
    }
  }

  private static injectLink(link: CustomLink): void {
    // Get the element to inject the link into
    const inElement = document.evaluate(
      link.location.onXPath,
      document,
      null, XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as Element;
    if (!inElement || inElement.hasAttribute('data-linkem-injected')) return;
    this.applyLinkToElement(link, inElement);
    inElement.setAttribute('data-linkem-injected', 'true');
  }

  private static applyLinkToElement(link: CustomLink, element: Element): void {
    const text = element.textContent || '';
    const href = formatLinkHref(link, text);

    if (link.location.position === 'on_text') {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      a.target = '_blank';
      element.textContent = '';
      element.appendChild(a);
    } else if (link.location.position === 'next_to_text') {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = link.location.displayName || link.name;
      a.target = '_blank';
      a.style.marginLeft = '5px';
      element.appendChild(a);
    }
  }
}