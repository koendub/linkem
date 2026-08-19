import { Link } from "@/core/types";


class CustomTemplateException extends Error {
  constructor(errorInSection: string, msg: string) {
    super(errorInSection + ": " + msg);
  }
}

/**
 * The regex strings for finding template parts in strings.
 * For example: {text-value} or more generally {<replacer_name>(<args>).<extra_funcs>(<args>)}.
 * The args part is optional and depends on the replacer.
 */
const regexSingleFunction = /\.[a-zA-Z]+\([^\)]*?\)/g;
export const regexFindAllTemplates = /\{([a-z\-]+)(\([^\)]*?\))?((?:\.[a-zA-Z]+\([^\)]*?\))*)\}/g;

type TemplateValueReplacers<ExtraValues> = {
  [name: string]: {
    description: string,
    replace: (inlineArgs: string | null, extras: ExtraValues) => string,
  }
};

/**
 * Apply some string editing functions from strings.
 * For example { onValue: 'test', funcStrings: [ ".replace('t', 'b')", ".toUpperCase()" ] }
 * Should result in 'BEST'.
 */
function applyStringEditFunctions(onValue: string, funcStrings: string[]) {
  const stringEditFunctions: { [name: string]: { nargs: number, func: (val: string, rest: string[]) => string } } = {
    'replace': { nargs: 2, func: (val: string, [a, b]: string[]) => val.replace(a, b) },
    'replaceAll': { nargs: 2, func: (val: string, [a, b]: string[]) => val.replaceAll(a, b) },
    'split': { nargs: 2, func: (val: string, [on, take]: string[]) => val.split(on)[parseInt(take)] },
    'toUpperCase': { nargs: 0, func: (val: string) => val.toUpperCase() },
    'toLowerCase': { nargs: 0, func: (val: string) => val.toLowerCase() },
    'capitalize': { nargs: 0, func: (val: string) => (
      val.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
    )},
    'stripLeft': { nargs: 1, func: (val: string, [chars]) => (
      val.startsWith(chars) ? val.substring(chars.length) : val
    )},
    'stripRight': { nargs: 1, func: (val: string, [chars]) => (
      val.endsWith(chars) ? val.substring(0, val.length - chars.length) : val
    )},
    'prettify': { nargs: 0, func: (val: string) => {
      let processedVal = val.startsWith("www.") ? val.substring(4) : val;
      processedVal = processedVal.endsWith(".com") ? processedVal.substring(0, processedVal.length - 4) : processedVal;
      return processedVal
        .replace(/[_\-]+/g, ' ')
        .split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
    }},
  }

  return funcStrings.reduce((currValue, funcStr) => {
    const funcName = funcStr.split('(')[0].slice(1);
    const argsStr = funcStr.split("(")[1].slice(0, -1);
    const args = argsStr.trim().length > 0 ? argsStr.split(",").map(a => {
      if (a.endsWith("'") || a.endsWith('"')) {
        while (a.startsWith(" ")) a = a.slice(1);
        if (a.startsWith(a.charAt(a.length - 1))) return a.slice(1, -1);
      }
      return a;
    }) : [];
    const func = stringEditFunctions[funcName];
    if (!func) throw Error(`Template function ${funcName} does not exist`);
    if (func.nargs !== args.length) throw Error(`Template function ${funcName} expected ${func.nargs} args, but got ${args.length}`);
    return func.func(currValue, args);
  }, onValue);
}

/**
 * Given some text and the currently selected text, the replacers for the initial value, and possibly some extra data.
 * This function returns a string where all template parts (as found by the regex above), are replaced with real string values.
 */
function replaceTemplate<ExtraValues>(text: string, valueReplacers: TemplateValueReplacers<ExtraValues>, extras: ExtraValues) {
  const templateParts = text.matchAll(regexFindAllTemplates);
  for (let match of [...templateParts]) {
    const [fullMatch, valueName, valueArgs, extraFuncsStr] = match;
    const extraFuncs = extraFuncsStr ? (extraFuncsStr.match(regexSingleFunction) || []) : [];
    try {
      // Replace the first bit with the new value string
      const valueReplacer = valueReplacers[valueName];
      if (!valueReplacer) throw new Error(`Unknown value replacer ${valueName}`);
      const value = valueReplacer.replace(valueArgs ? valueArgs.slice(1, -1) : null, extras);
      // Apply any extra functions to it, and then replace it in the final string
      const finalValue = applyStringEditFunctions(value, extraFuncs);
      text = text.replace(fullMatch, finalValue);
    } catch(e: any) {
      throw new CustomTemplateException(fullMatch, e.message);
    }
  }
  return text;
}

/**
 * The available replacers that can be used in the URL format of a link/subpage, or the text content of a text element.
 */
export const urlValueReplacers: TemplateValueReplacers<string> = {
  "text-value": {
    description: "The text at the link location",
    replace: (_inlineArgs: string | null, selectedText: string) => selectedText,
  },
  "url-part-index": {
    description: "Value of the URL part at the specified index",
    replace: (args: string | null, _selectedText: string) => {
      if (!args || !args.match(/^[0-9]+$/)) throw new EvalError(`Argument must be a single integer`);
      const parts = window.location.pathname.split('/');
      const requestedIdx = +args;
      if (parts.length <= requestedIdx) throw new EvalError(`Index ${requestedIdx} requested, but url has ${parts.length} parts`);
      return parts[requestedIdx];
    },
  },
  "url-part-after": {
    description: "Value of the URL part after a given text",
    replace: (args: string | null, _selectedText: string) => {
      if (!args) throw new EvalError(`Argument must be provided`);
      const parts = window.location.pathname.split('/');
      const idx = parts.indexOf(args);
      if (idx === -1) throw new EvalError(`part text '${args}' not found in url`);
      return parts[idx + 1];
    },
  },
  "url-param": {
    description: "The value of the specified URL parameter",
    replace: (args: string | null, _selectedText: string) => {
      if (!args) throw new EvalError(`Argument must be provided`);
      const params = new URLSearchParams(document.location.search);
      return params.get(args) || "";
    }
  }
}

export function formatUrlFormat(link: Link, selectedText: string) {
  return replaceTemplate(link.url_format || '', urlValueReplacers, selectedText);
}

/**
 * The available replacers for the name of a link or subpage.
 */
const linkDisplayNameValueReplacers: TemplateValueReplacers<Link> = {
  "href-host": {
    description: "The host part of the link URL",
    replace: (_inlineArgs: string | null, link: Link) => new URL(link.url_format || '').host,
  },
}

export function formatLinkDisplayName(link: Link) {
  if (!link.display_name) return link.name;
  return replaceTemplate(link.display_name, linkDisplayNameValueReplacers, link);
}

/**
 * The content of a text element, templated the same way a URL format is (can reference the selected text or host page URL parts).
 */
export function formatTextContent(link: Link, selectedText: string) {
  if (!link.display_name) return selectedText || link.name;
  return replaceTemplate(link.display_name, urlValueReplacers, selectedText);
}
