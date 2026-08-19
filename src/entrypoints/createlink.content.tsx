import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { EditLinkView } from '@/components/editing/EditLinkView';
import { SelectElementTypeView } from '@/components/editing/SelectElementTypeView';
import styleText from '@/components/style.css?inline';
import { LinkType, LinkWithConditions, UnstoredLinkWithConditions } from '@/core/types';
import { getElementByXPath, getXPath, moveXPathUp } from '@/core/utils/xpath';
import { linksStorage } from '@/core/storage/local_storage';
import { checkInjectLinks, DEFAULT_LINK_COLOR } from '@/core/inject';


let lastXPath: string | undefined = undefined;

document.addEventListener('contextmenu', (event) => {
  lastXPath = getXPath(event.target as Element, false);
});

async function defaultOnLinkSave(link: LinkWithConditions | UnstoredLinkWithConditions) {
  await linksStorage.updateLinks([link]);
  await checkInjectLinks()
}

function CreateElementFlow({
  selectedText,
  url,
  xpath,
  onSave,
  onClose,
}: {
  selectedText: string;
  url: string;
  xpath: string;
  onSave: (link: LinkWithConditions | UnstoredLinkWithConditions) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<LinkType | null>(null);

  if (!type) {
    return (
      <div className='w-116 max-w-full max-h-full rounded-lg overflow-hidden shadow-lg'>
        <SelectElementTypeView onSelect={setType} onClose={onClose} />
      </div>
    );
  }

  return (
    <div className='w-116 h-154 max-w-full max-h-full rounded-lg overflow-hidden shadow-lg'>
      <EditLinkView
        initialLink={createInitialLinkData(type, selectedText, url, xpath)}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}

function showCreateLinkModal(
  selectedText: string | undefined = undefined,
  url: string | undefined = undefined,
  xpath: string | undefined = undefined,
  onSave: (link: LinkWithConditions | UnstoredLinkWithConditions) => void = defaultOnLinkSave
) {
  const useSelectedText = selectedText || window.getSelection()?.toString();
  if (!useSelectedText || useSelectedText.length === 0) throw Error('No selected text found for the new link');
  const useXpath = xpath || lastXPath || getXPath(window.getSelection()?.anchorNode?.parentElement as Element, false);
  if (!useXpath || useXpath.length === 0) throw Error('No initial XPath found for the new link');
  const useUrl = url || window.location.href;

  const [documentShadowContainer, modalReactRoot] = createShadowRootContainer();
  document.body.appendChild(documentShadowContainer);
  const root = ReactDOM.createRoot(modalReactRoot);

  const handleClose = () => {
    root.unmount();
    document.body.removeChild(documentShadowContainer);
  };

  root.render(
    <React.StrictMode>
      <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-10000 flex items-center justify-center'>
        <CreateElementFlow
          selectedText={useSelectedText}
          url={useUrl}
          xpath={useXpath}
          onClose={handleClose}
          onSave={onSave}
        />
      </div>
    </React.StrictMode>
  );
}

function createInitialLinkData(type: LinkType, selectedText: string, url: string, xpath: string): UnstoredLinkWithConditions {
  // Try to guess the most applicable regex for the selected text
  selectedText = selectedText.trim();
  let selectedTextRe = selectedText;

  // If the xpath element does not have all the selected text, move up in xpath until it does
  let totalTextXpath = xpath;
  let totalTextElement = getElementByXPath(totalTextXpath);
  while (totalTextElement && !totalTextElement.textContent.includes(selectedText)) {
    [totalTextXpath, totalTextElement] = moveXPathUp(totalTextXpath, totalTextElement);
  }

  // If the selected text is all the text within this element, just replace everything with .+
  // Because the user probably just meant this element in the page, and doesn't care about the exact text
  if (selectedText.trim().length > 0) {
    if (totalTextElement && totalTextElement.textContent?.trim() === selectedText.trim()) {
      selectedTextRe = '.+';
    }
  }

  // Replace all sequences of digits with \d+, since I assume the user does not care about the specific number
  selectedTextRe = selectedTextRe.replace(/\d+/g, '\\d+');

  const typeLabel = type === 'text' ? 'Text' : type === 'subpage' ? 'Subpage' : 'Link';

  const base = {
    // Basic info
    type,
    name: selectedText ? `${typeLabel} on ${selectedText}` : `New ${typeLabel}`,
    visibility: 'private',
    icon: null,
    color: null,
    allow_multiple_injections_per_element: false,

    conditions: [
      { id: '', link_id: '', type: 'url_start' as const, value: url?.split('?')[0] || '', created_at: '' },
      // { id: '', link_id: '', type: 'xpath_exists' as const, value: totalTextXpath || '', created_at: '' }
    ],

    on_xpath: totalTextXpath || '',
    on_selected_text_regex: selectedTextRe,
    position: 'next_to_text' as const,
    url_format: null as string | null,
    display_name: null as string | null,
    iframe_width: null as string | null,
    iframe_height: null as string | null,
  };

  if (type === 'text') {
    return { ...base, display_name: '{text-value}', color: DEFAULT_LINK_COLOR };
  }
  if (type === 'subpage') {
    return { ...base, url_format: '' };
  }
  // link
  return { ...base, url_format: 'https://www.google.com/search?q={text-value}', display_name: '{href-host.prettify()}' };
}

function createShadowRootContainer(): [HTMLDivElement, HTMLDivElement] {
  // Create shadow root to isolate styles, also import the tailwind styles
  const shadowRootContainer = document.createElement('div');
  const shadowRoot = shadowRootContainer.attachShadow({ mode: 'open' });

  // https://github.com/tailwindlabs/tailwindcss/discussions/15556#discussioncomment-15063817
  const usingTailwindFallback = (styles: string) => {
    const tailwindCompatCheckString = '(((-webkit-hyphens: none)) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b))))';
    if (styles.includes(tailwindCompatCheckString)) {
      return styles.replace(tailwindCompatCheckString, '(display: block)');
    } else if (styles.includes(tailwindCompatCheckString.replaceAll(': ', ':'))) {
      return styles.replace(tailwindCompatCheckString.replaceAll(': ', ':'), '(display: block)');
    } else {
      console.warn('Tailwind CSS compatibility check string not found in styles. Tailwind may not work correctly in the shadow DOM. This worked with v4.2.2...');
      return styles;
    }
  };

  const style = document.createElement("style");
  style.textContent = usingTailwindFallback(styleText);
  shadowRoot.appendChild(style);

  // REM might not work well without this, according to this post. So might as well add it, can't hurt.
  // https://dev.to/dhirajarya01/how-i-finally-made-tailwindcss-work-inside-the-shadow-dom-a-real-case-study-5gkl
  // const style2 = document.createElement("style");
  // style2.textContent = ":host, * { font-size: 16px; }";
  // shadowRoot.appendChild(style2);

  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'linkem-modal-container';
  shadowRoot.appendChild(modalContainer);

  // Return the root that should be attached to the document,
  // and the container inside the shadow root where the React app should be rendered
  return [shadowRootContainer, modalContainer];
}

export default defineContentScript({
  registration: 'runtime',
  main: () => showCreateLinkModal()
});
