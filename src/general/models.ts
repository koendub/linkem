
export interface Condition {
  type: 'url_start' | 'url_contains' | 'xpath_match' | 'value_match';
  value: string;
}

export interface CustomLink {
  id: string;
  name: string;
  creator: string;
  position: 'on_text' | 'next_to_text';
  displayName?: string; // for next_to_text
  icon?: string; // optional icon URL
  hrefPathFormat: string; // e.g., "http://example.com/search/{text_value}"
  conditions: Condition[];
  visibility: 'private' | 'public';
  createdAt: Date;
}

export interface LinkemLibrary {
  name: string;
  links: CustomLink[];
}
