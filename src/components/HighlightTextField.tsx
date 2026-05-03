
import React from 'react';

interface HighlightTextFieldProps {
  value: string;
  onChange: (newValue: string) => void;
  highlights: RegExp;
}

/**
 * A highlight text field should function as a text field, but with one added feature: highlighting.
 * This means that the value in the textfield should always be checked for matches with the highlights regex.
 * Any found matches should be highlighted in the text inside the textfield, while leaving any unmatched text unchanged.
 */
export function HighlightTextField({ value, onChange, highlights}: HighlightTextFieldProps) {
  // Split the text into matched and non-matched parts
  const renderHighlightedText = () => {
    const parts: Array<{ text: string; isHighlighted: boolean }> = [];
    let lastIndex = 0;
    let match;

    // Create a new regex with the global flag to find all matches
    const globalRegex = new RegExp(highlights.source, 'g' + (highlights.ignoreCase ? 'i' : ''));

    while ((match = globalRegex.exec(value)) !== null) {
      // Add the part before the match
      if (match.index > lastIndex) {
        parts.push({ text: value.substring(lastIndex, match.index), isHighlighted: false });
      }
      // Add the matched part
      parts.push({ text: match[0], isHighlighted: true });
      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last match
    if (lastIndex < value.length) {
      parts.push({ text: value.substring(lastIndex), isHighlighted: false });
    }

    return parts;
  };

  const highlightedParts = renderHighlightedText();

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent',
          color: 'inherit',
          padding: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          width: '100%',
          caretColor: 'black',
          outline: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          border: '1px solid #0000',
          overflow: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          color: 'transparent',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {highlightedParts.map((part, index) =>
          part.isHighlighted ? (
            <mark key={index} className='bg-blue-200 text-transparent rounded-sm'>
              {part.text}
            </mark>
          ) : (
            <span key={index} className='text-transparent'>
              {part.text}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
