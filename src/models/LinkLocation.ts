
export interface LinkLocation {
  /**
   * The XPath on the page, where the link should be display in or next to.
   */
  onXPath: string;

  /**
   * The selected text within the XPath element where this link should be displayed.
   * This can be literal text, but more likely is a regex expression, like "[0-9]{4}".
   * If this is undefined, we consider the whole content of the XPath element to be selected.
   */
  onSelectedTextRegex?: string;

  /**
   * The position where the link should be displayed. In the case of 'on_text', the link is
   * made around the selected text part of the element. In the case of 'next_to_text' the link
   * is inserted right after the selected text.
   * 
   * In the case of 'user_default', the user's preferences determine which option it is.
   */
  position: 'on_text' | 'next_to_text' | 'user_default';

  /**
   * Extra values for in case the position 'next_to_text' is selected.
   */
  displayName?: string;
  icon?: string;
}