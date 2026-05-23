import { Condition } from "@/core/types";
import { Plus, Trash2 } from "lucide-react";

interface EditConditionsViewProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  simpleMode: boolean;
}

interface InternalEditConditionsViewWithOriginalUrlProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  originalUrl: string | undefined;
}

export function EditConditionsView({ conditions, onChange, simpleMode }: EditConditionsViewProps) {
  const originalUrlStartCondition = useRef(conditions.find(c => c.type === 'url_start'));
  const originalUrl = originalUrlStartCondition.current?.value;
  if (simpleMode) {
    return <SimpleConditionsEditor conditions={conditions} onChange={onChange} originalUrl={originalUrl} />
  } else {
    return <ExactConditionsEditor conditions={conditions} onChange={onChange} originalUrl={originalUrl} />

  }
}

function urlStartConditionFunctions(conditions: Condition[], onChange: (conditions: Condition[]) => void, originalUrl: string | undefined) {
  const urlStartConditionIdx = conditions.findIndex(c => c.type === 'url_start');
  const urlStartCondition = urlStartConditionIdx !== -1 && conditions[urlStartConditionIdx];

  const updateCondition = (index: number, condition: Condition) => {
    const newConditions = [...conditions];
    newConditions[index] = condition;
    onChange(newConditions);
  };

  const addUrlStartCondition = urlStartConditionIdx === -1 ? () => {
    // Add url_start condition with current URL if not present
    const newCondition: Condition = {
      id: '',
      link_id: '',
      type: 'url_start',
      value: window.location.href,
      created_at: new Date().toISOString(),
    };
    onChange([...conditions, newCondition]);
  } : undefined;

  const decreaseUrlConditionLength = (urlStartCondition && urlStartCondition.value.lastIndexOf('/') !== -1 && !urlStartCondition.value.match(/[^\/]+:\/\/[^\/]+\/?/g)) ? () => {
    const newUrl = urlStartCondition.value.substring(0, urlStartCondition.value.lastIndexOf('/'));
    const newCondition = { ...urlStartCondition, value: newUrl };
    updateCondition(urlStartConditionIdx, newCondition);
  } : undefined;

  const increaseUrlConditionLength = (urlStartCondition && originalUrl && originalUrl.startsWith(urlStartCondition.value)) && urlStartCondition.value.length < originalUrl.length ? () => {
    const originalLeft = originalUrl.substring(urlStartCondition.value.length);
    const newPart = originalLeft.indexOf('/', 1) === -1 ? originalLeft : originalLeft.substring(0, originalLeft.indexOf('/', 1));
    const newUrl = urlStartCondition.value + newPart;
    const newCondition = { ...urlStartCondition, value: newUrl };
    updateCondition(urlStartConditionIdx, newCondition);
  } : undefined;

  const currentUrl = urlStartCondition ? urlStartCondition.value : undefined;
  return { currentUrl, addUrlStartCondition, decreaseUrlConditionLength, increaseUrlConditionLength };
}

function SimpleConditionsEditor({ conditions, onChange, originalUrl }: InternalEditConditionsViewWithOriginalUrlProps) {
  const { currentUrl, addUrlStartCondition, decreaseUrlConditionLength, increaseUrlConditionLength } = urlStartConditionFunctions(conditions, onChange, originalUrl);
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
      {addUrlStartCondition ? (
        <div className="flex-1">
          <p className="font-medium text-gray-900">This link is enabled for ALL website everywhere!</p>
          <button
            onClick={addUrlStartCondition}
            className={`ml-3 px-4 py-1 rounded font-medium text-sm transition-colors`}
          >
            Add a URL start condition
          </button>
        </div>
      ) : (
        <div className="flex-1">
          <p className="font-medium text-gray-900">This link is currently enabled on:</p>
          <p className="font-medium text-gray-900">{currentUrl}</p>
          <button
            onClick={decreaseUrlConditionLength}
            className={`ml-3 px-4 py-1 rounded font-medium text-sm transition-colors`}
          >
            Make less specific
          </button>
          <button
            onClick={increaseUrlConditionLength}
            className={`ml-3 px-4 py-1 rounded font-medium text-sm transition-colors`}
          >
            Make more specific
          </button>
        </div>
      )}
    </div>
  );
}

function ExactConditionsEditor({ conditions, onChange, originalUrl }: InternalEditConditionsViewWithOriginalUrlProps) {
  const urlStartConditionIdx = conditions.findIndex(c => c.type === 'url_start');
  const { decreaseUrlConditionLength, increaseUrlConditionLength } = urlStartConditionFunctions(conditions, onChange, originalUrl);

  const updateCondition = (index: number, condition: Condition) => {
    const newConditions = [...conditions];
    newConditions[index] = condition;
    onChange(newConditions);
  };

  return (
    <div className="px-4 py-3">
      <p className='text-sm text-gray-800 mb-1'>A custom link will only be shown if all its conditions are met.</p>
      <div className="space-y-2">
        {conditions.map((cond, index) => (
          <div key={index} className="flex flex-wrap gap-2 items-center p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <button
              onClick={() => onChange(conditions.filter((_, i) => i !== index))}
              className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors flex items-center justify-center w-auto!"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <select
              value={cond.type}
              onChange={(e) => updateCondition(index, { ...cond, type: e.target.value as any })}
              className="w-auto!"
            >
              <option value="xpath_exists">XPath Exists</option>
              <option value="value_match">Value Match</option>
              <option value="url_contains">URL Contains</option>
              <option value="text_contains">Text Contains</option>
              {
                // Only allow one url_start condition, so only show the option if there isn't
                // already one or if this condition is the existing url_start condition
                (cond.type === 'url_start' || urlStartConditionIdx === -1) && (
                  <option value="url_start">URL Starts With</option>
                )
              }
            </select>
            <input
              value={cond.value}
              onChange={(e) => updateCondition(index, { ...cond, value: e.target.value })}
              placeholder="Condition value"
              className='w-full'
            />
            {urlStartConditionIdx === index && (
              // Some extra buttons for ease of use
              <>
              {decreaseUrlConditionLength && (
                <button
                  onClick={decreaseUrlConditionLength}
                  className='mt-1 px-4 py-1 mx-auto bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center flex-col transition-colors active:bg-blue-800 flex-1'
                >
                  <div>Shorten</div>
                  <div className="text-xs">the last part</div>
                </button>
              )}
              {increaseUrlConditionLength && (
                <button
                  onClick={increaseUrlConditionLength}
                  className='mt-1 px-4 py-1 mx-auto bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center flex-col transition-colors active:bg-blue-800 flex-1'
                >
                  <div>Restore</div>
                  <div className="text-xs">the last part</div>
                </button>
              )}
              </>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...conditions, { id: '', link_id: '', type: 'value_match', value: '', created_at: new Date().toISOString() }])}
        className="mt-3 px-4 py-1 mx-auto bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center transition-colors"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Condition
      </button>
    </div>
  )
}
