import { LinkWithConditions, Condition } from '@/core/types';
import { getElementByXPath } from './utils/xpath';

const urlMatchConditions = {
  'url_start': {
    check: (c: Condition, url: string) => url.startsWith(c.value),
    explanation: (c: Condition, url: string) => `URL does not start with "${c.value}".`
  },
  'url_contains': {
    check: (c: Condition, url: string) => url.includes(c.value),
    explanation: (c: Condition, url: string) => `URL does not contain "${c.value}".`
  },
}

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

export function getFailingUrlConditions(link: LinkWithConditions, url: string): Condition[] {
  return link.conditions.filter(c => (
    c.type.startsWith('url')
    && !urlMatchConditions[c.type as keyof typeof urlMatchConditions]!.check(c, url)
  ));
}

export function getFailingPreMatchConditions(link: LinkWithConditions): Condition[] {
  return link.conditions.filter(c => (
    c.type in preMatchConditions
    && !preMatchConditions[c.type as keyof typeof preMatchConditions]!.check(c)
  ));
}

export function getFailingPostMatchConditions(link: LinkWithConditions, matchedElement: Element): Condition[] {
  return link.conditions.filter(c => (
    c.type in postMatchConditions
    && !postMatchConditions[c.type as keyof typeof postMatchConditions]!.check(c, matchedElement)
  ));
}
