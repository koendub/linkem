import { DEFAULT_LINK_COLOR } from "@/core/inject";
import { LinkWithConditions, UnstoredLinkWithConditions } from "@/core/types";
import { findMoreGeneralXPath } from "@/core/utils/xpath";
import { XCircleIcon } from "lucide-react";
import { HexColorPicker } from "react-colorful";

interface  DisplayEditorProps {
  link: LinkWithConditions | UnstoredLinkWithConditions;
  setLink: (link: LinkWithConditions | UnstoredLinkWithConditions) => void;
}

async function remoteFindMoreGeneralXPath(onUrl: string, currentXpath: string) {
  if (window?.location?.href && window.location.href.startsWith('http')) {
    // if we are running in the content page itself, we dont have to do the remote call
    if (!window.location.href.startsWith(onUrl)) throw Error('Content href is not link href. Please report this as a bug.');
    return findMoreGeneralXPath(currentXpath);
  }
  const tabs = await browser.tabs.query({ url: onUrl });
  if (tabs.length === 0) throw Error('Cannot find more elements to show when the url of this link is not open.');
  if (tabs.length > 1) console.warn('Multiple tabs have this url open, using the first one to search for best xpath');
  const targetTab = tabs[0]!;
  const callResult = await browser.scripting.executeScript({
    target: { tabId: targetTab.id! },
    func: findMoreGeneralXPath,
    args: [currentXpath]
  });
  const moreGeneralXpath = callResult[0].result;
  if (!moreGeneralXpath) throw Error('Did not find more similar elements');
  return moreGeneralXpath;
}

function useRemoteFindGeneralXPathFunc({ link, setLink }: DisplayEditorProps) {
  const urlStartValue = link.conditions.find(c => c.type === 'url_start')?.value;
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchCount, setMatchCount] = useState<number | undefined>();
  const [error, setError] = useState<string | undefined>();
  if (!urlStartValue) return null;
  
  const findMoreGeneralXPathFunc = async () => {
    setIsProcessing(true);
    setError(undefined);
    try {
      const result = await remoteFindMoreGeneralXPath(urlStartValue, link.on_xpath);
      if (!result) return;
      setLink({ ...link, on_xpath: result.newXPath });
      setMatchCount(result.matchCount);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, error, matchCount, findMoreGeneralXPathFunc };
}

function RemoteFindMoreGeneralXPathButton({ isProcessing, error, matchCount, findMoreGeneralXPathFunc }: NonNullable<ReturnType<typeof useRemoteFindGeneralXPathFunc>>) {
  return (
    <>
      {matchCount && (<div>Similar elements found! Showing currently on {matchCount} elements on this page.</div>)}
      <div className="flex items-center justify-center gap-2">
        <button
        disabled={isProcessing}
        onClick={findMoreGeneralXPathFunc}
        className="px-4 py-1 mx-auto bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors active:bg-blue-800 flex-1">
          {isProcessing ? 'Finding similar elements...' : 'Show on more elements'}
        </button>
      </div>
      {error && (
        <div className="p-1 bg-red-400 m-1 rounded-lg flex justify-center items-center">
          <XCircleIcon className="inline-block mr-2" width={16} />
          {error}
        </div>
      )}
    </>
  )
}

export function SimpleDisplayEditor({ link, setLink }: DisplayEditorProps) {
  const generalXPathStuff = useRemoteFindGeneralXPathFunc({ link, setLink });
  return (
    <>
      <div className="flex flex-col p-2 bg-white border border-gray-200 rounded-lg w-full">
        <label className="p-1">Link Position</label>
        <select
          value={link.position}
          onChange={(e) => setLink({ ...link, position: e.target.value as any })}
        >
          <option value="user_default">User Default</option>
          <option value="on_text">On Text</option>
          <option value="next_to_text">Next to Text</option>
        </select>
      </div>
      {generalXPathStuff && (
        <div className="flex flex-col p-2 bg-white border border-gray-200 rounded-lg w-full">
          <div className="w-full pt-2">
            <label className="p-1">Need this link to show on all similar elements on this page?</label>
            <RemoteFindMoreGeneralXPathButton {...generalXPathStuff} />
          </div>
        </div>
      )}
    </>
  );
}

export function ExactDisplayEditor({ link, setLink }: DisplayEditorProps) {
  const generalXPathStuff = useRemoteFindGeneralXPathFunc({ link, setLink });
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
        <label className='p-0 m-0'>Display Color</label>
        <button
          onClick={() => setLink({ ...link, color: link.color ? null : DEFAULT_LINK_COLOR })}
          className={`px-3 py-1 rounded transition-colors font-medium text-sm mb-1 bg-blue-500 text-white hover:bg-blue-600`}
        >
          {link.color ? 'Unset custom color' : 'Set custom color'}
        </button>
        {link.color && (
          <>
            <div>Current color {link.color}</div>
            <HexColorPicker color={link.color} onChange={(v) => setLink({ ...link, color: v })} />
          </>
        )}
      </div>
      <div>
        <label>On Element XPath</label>
        <input
          value={link.on_xpath}
          onChange={(e) => setLink({ ...link, on_xpath: e.target.value })}
          placeholder="Enter element XPath (e.g. /html/body/div[1]/p[2])"
          className="mb-1"
        />
        {generalXPathStuff && <RemoteFindMoreGeneralXPathButton {...generalXPathStuff} />}
      </div>
      <div>
        <label>On Text Regex</label>
        <input
          value={link.on_selected_text_regex || ''}
          onChange={(e) => setLink({ ...link, on_selected_text_regex: e.target.value })}
          placeholder='Enter text regex (use ".+" to match all text)'
        />
      </div>
      <div>
        <label>Allow Multiple Injections Per Element</label>
        <input
          type="checkbox"
          checked={link.allow_multiple_injections_per_element || false}
          onChange={(e) => setLink({ ...link, allow_multiple_injections_per_element: e.target.checked })}
        />
      </div>
    </div>
  )
}
