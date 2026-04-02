import { Link } from "@/types/supabase";

class CustomHrefFormatException extends Error {
  constructor(errorInSection: string, msg: string) {
    super(errorInSection + ": " + msg);
  }
}

/**
 * The regex for finding a placeholder in the hrefPathFormat, like {text-value} or more
 * generally {<replacer_name>:<argument>}. The argument part is optional and depends on the replacer.
 */
const regexFor = (name: string) => new RegExp(String.raw`{${name}(:[^}]*?)?}`, 'g');

/**
 * The available replacers that can be used in the hrefPathFormat of a link.
 * Each replacer has a name, a function that generates the replacement value,
 * and a regex for finding it in the hrefPathFormat.
 */
const hrefReplacers = [
  {
    name: "text-value",
    func: (selectedText: string, _args: string | null) => selectedText
  },
  {
    name: "url-part-after",
    func: (_: string, args: string | null) => {
      if (!args) throw new EvalError(`Argument must be provided`);
      const parts = window.location.pathname.split('/');
      const idx = parts.indexOf(args);
      if (idx === -1) throw new EvalError(`part text '${args}' not found in url`);
      return parts[idx + 1];
    }
  },
  {
    name: "url-part-index",
    func: (_: string, args: string | null) => {
      if (!args || !args.match(/^[0-9]+$/)) throw new EvalError(`Argument must be a single integer`);
      const parts = window.location.pathname.split('/');
      const requestedIdx = +args;
      if (parts.length <= requestedIdx) throw new EvalError(`Index ${requestedIdx} requested, but url has ${parts.length} parts`);
      return parts[requestedIdx];
    }
  },
  {
    name: "url-param",
    func: (_: string, args: string | null) => {
      if (!args) throw new EvalError(`Argument must be provided`);
      const params = new URLSearchParams(document.location.search);
      return params.get(args) || "";
    }
  }
].map(replacer => ({ ...replacer, regex: regexFor(replacer.name) }));

/**
 * Given a link and the currently selected text, format the href of the link by replacing
 * the placeholders in the hrefPathFormat with the actual values.
 * 
 * @param link The link for which to format the href
 * @param selectedText The currently selected text on the page, which can be used in the formatting
 * @returns The formatted href without placeholders.
 */
export function formatLinkHref(link: Link, selectedText: string) {
  return hrefReplacers.reduce((curr, replacer) => {
    try {
      return curr.replace(
        replacer.regex,
        (_, arg: string) => replacer.func(selectedText, arg ? arg.slice(1) : null)
      );
    } catch(e: any) {
      throw new CustomHrefFormatException(replacer.name, e.message);
    }
  }, link.href_path_format);
}
