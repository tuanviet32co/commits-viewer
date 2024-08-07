import React, { useState } from 'react';
import { Button } from 'antd';

export const CommitItem = ({ data, isDup }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  // Split the data by lines and parse the content
  const lines = data.split('\n');
  const defaultLine = lines[0];
  const detailLines = lines.slice(1).join('\n').split('\r\n\r\n');

  return (
    <div
      className={`px-6 py-3 rounded border border-stone-200 ${isDup ? 'bg-yellow-100' : ''}`}
    >
      <div className='flex justify-between items-center'>
        <div>{defaultLine}</div>
        {detailLines?.length && JSON.stringify(detailLines) !== '[""]' &&
          <Button type="link" onClick={handleExpand}>
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        }
      </div>

      {expanded && (
        <div>
          {detailLines.map((line, index) => (
            <div key={index}>
              {line.startsWith('* ') ? (
                <p>
                  <strong>{line.slice(2)}</strong>
                </p>
              ) : line.startsWith('Co-authored-by:') ? (
                <p>{line}</p>
              ) : (
                <ul>
                  {line.split('\r\n').map((subLine, subIndex) => (
                    <li key={subIndex}>{subLine}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
