import { CustomLink } from "@/models";

class CustomHrefFormatException extends Error {
  constructor(errorInSection: string, msg: string) {
    super()
  }
}

const hrefReplacers = [
  {
    name: "text-value",
    func: (selectedText: string, _: string | null) => selectedText
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
]

const regexFor = (name: string) => new RegExp(String.raw`{${name}(:[^}]*?)?}`, 'g');


export function highlightLinkHref(link: CustomLink) {
  return link.hrefPathFormat;
}

export function formatLinkHref(link: CustomLink, selectedText: string) {
  return hrefReplacers.reduce((curr, replacer) => {
    try {
      return curr.replace(
        regexFor(replacer.name),
        (_, arg: string) => replacer.func(selectedText, arg ? arg.slice(1) : null)
      );
    } catch(e: any) {
      throw new CustomHrefFormatException(replacer.name, e.message);
    }
  }, link.hrefPathFormat);
}