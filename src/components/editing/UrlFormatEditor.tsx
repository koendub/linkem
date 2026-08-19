import { urlValueReplacers, regexFindAllTemplates } from "@/core/replacer";
import { LinkWithConditions, UnstoredLinkWithConditions } from "@/core/types";
import { Accordion } from "@base-ui/react";
import { InfoIcon } from "lucide-react";
import { HighlightTextField } from "./HighlightTextField";


interface UrlFormatEditorProps {
  link: LinkWithConditions | UnstoredLinkWithConditions;
  onChange: (link: LinkWithConditions | UnstoredLinkWithConditions) => void;
}

export function UrlFormatEditor({ link, onChange }: UrlFormatEditorProps) {
  return (
    <div>
      <HighlightTextField
        value={link.url_format || ''}
        onChange={(nv) => onChange({ ...link, url_format: nv })}
        highlights={regexFindAllTemplates}
      />
      <Accordion.Root>
        <Accordion.Item value="template-explain">
          <Accordion.Header>
            <Accordion.Trigger className="w-full px-1 py-1 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors block">
              Use templates like <span className="rounded font-mono bg-blue-200">{`{text-value}`}</span> to insert the selected text.
              <InfoIcon className='ml-2 inline-block' size={14} />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="smooth-accordion-panel text-sm">
              <ul>
                {Object.entries(urlValueReplacers).map(([key, replacer]) => (
                  <li key={key}>
                    <span className="rounded font-mono bg-blue-200">{`{${key}}`}</span> - {replacer.description}
                  </li>
                ))}
              </ul>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  )
}
