import { LinkCondition } from "./LinkCondition";

export interface CustomLink {
  /////////////////////////////////////////////////////////// Basic info

  /**
   * The unique ID of the link. This is generated when the link is
   * created and should not be changed afterwards.
   */
  id: string;

  /**
   * The name of the link, which is shown to users when listing links. This should be short.
   */
  name: string;

  /**
   * The id of the user that created this link.
   */
  creator: string;

  /**
   * The date when the link was created. This is generated when the link is first stored.
   */
  createdAt: Date;

  /**
   * If and how to share this link with other users.
   *  - 'local' means the link is only stored locally and won't leave the device.
   *  - 'private' means the link is stored in the cloud but only visible to the creator.
   *  - 'public' means the link is stored in the cloud and (can be made) visible to all users.
   */
  visibility: 'local' | 'private' | 'public';

  /**
   * The conditions that determine when this link should be injected.
   * All conditions should be met for the link to be injected.
   */
  conditions: LinkCondition[];

  /////////////////////////////////////////////////////////// About the link display and workings

  /**
   * The format of the href attribute of the link. This can be a simple URL, but can also
   * contain placeholders like '{text-value}' which will be replaced with the actual
   * values when the link is displayed.
   */
  hrefPathFormat: string;

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

export type UnstoredLink = Omit<CustomLink, 'id'>;
