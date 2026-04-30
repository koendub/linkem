import { Link } from "./extra_types";


export function getLinkName(link: Link) {
  try {
    const host = new URL(link.href_format).host;
    return link.name.replace('{href_host}', host);
  } catch {
    return link.name;
  }
}
