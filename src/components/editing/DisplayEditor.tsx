import { LinkWithConditions, UnstoredLinkWithConditions } from "@/core/types";

interface  DisplayEditorProps {
  link: LinkWithConditions | UnstoredLinkWithConditions;
  setLink: (link: LinkWithConditions | UnstoredLinkWithConditions) => void;
}

export function DisplayEditor({ link, setLink }: DisplayEditorProps) {
  return (
    <div className="px-4 py-3 space-y-3">
      <div>
        <label>Position</label>
        <select
          value={link.position}
          onChange={(e) => setLink({ ...link, position: e.target.value as any })}
        >
          <option value="user_default">User Default</option>
          <option value="on_text">On Text</option>
          <option value="next_to_text">Next to Text</option>
        </select>
      </div>
      <div>
        <label className='p-0 m-0'>Display Name</label>
        <div className='text-xs text-gray-500 mb-1'>(for when position is 'Next to Text')</div>
        <input
          value={link.display_name || ''}
          onChange={(e) => setLink({ ...link, display_name: e.target.value })}
          placeholder="Enter display name"
        />
      </div>
      <div>
        <label>On Element XPath</label>
        <input
          value={link.on_xpath}
          onChange={(e) => setLink({ ...link, on_xpath: e.target.value })}
          placeholder="Enter element XPath (e.g. /html/body/div[1]/p[2])"
        />
      </div>
      <div>
        <label>On Text Regex</label>
        <input
          value={link.on_selected_text_regex || ''}
          onChange={(e) => setLink({ ...link, on_selected_text_regex: e.target.value })}
          placeholder='Enter text regex (use ".+" to match all text)'
        />
      </div>
    </div>
  )
}