import { CustomLink, Condition } from '../../general/models';

export class LinkInjector {
  static injectLinks(links: CustomLink[]): void {
    links.forEach(link => {
      if (link.conditions.every(this.checkCondition)) {
        console.log("Conditions passed! Injecting link!")
        this.injectLink(link);
      }
    });
  }

  private static checkCondition(condition: Condition): boolean {
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
    link.conditions.forEach(condition => {
      if (condition.type === 'xpath_match') {
        const element = document.evaluate(condition.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as Element;
        console.log("Found element to inject to: ", element)
        if (element && !element.hasAttribute('data-linkem-injected')) {
          this.applyLinkToElement(element, link);
          element.setAttribute('data-linkem-injected', 'true');
        }
      }
    });
  }

  private static applyLinkToElement(element: Element, link: CustomLink): void {
    const text = element.textContent || '';
    const href = link.hrefPathFormat.replace('{text_value}', encodeURIComponent(text));

    console.log("Applying link...", link.position)
    if (link.position === 'on_text') {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      a.target = '_blank';
      element.textContent = '';
      element.appendChild(a);
    } else if (link.position === 'next_to_text') {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = link.displayName || link.name;
      a.target = '_blank';
      a.style.marginLeft = '5px';
      element.appendChild(a);
    }
  }
}