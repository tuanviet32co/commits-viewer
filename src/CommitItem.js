import  { useState } from 'react';
import { Button } from 'antd';

const JiraLine = ({ defaultLine, index }) => {
  // Regex for Jira ticket (FRON-12653 or Fron 12607)
  const jiraRegex = /(FRON[-\s]?\d+)/i;
  // Regex for PR number (#1570)
  const prRegex = /#(\d+)/;

  let line = defaultLine;

  // --- JIRA ---
  const jiraMatch = line.match(jiraRegex);
  let jiraLink = null;
  if (jiraMatch) {
    const ticket = jiraMatch[0].replace(/\s/, "-"); // normalize Fron 12607 → FRON-12607
    const jiraUrl = `https://frontierco.atlassian.net/browse/${ticket.toUpperCase()}`;
    line = line.replace(
      jiraMatch[0],
      `<a href="${jiraUrl}" target="_blank" class="text-blue-600 underline">${jiraMatch[0]}</a>`
    );
  }

  // --- PR ---
  const prMatch = line.match(prRegex);
  if (prMatch) {
    const prNumber = prMatch[1];
    const prUrl = `https://github.com/32S-Dental/frontend/pull/${prNumber}/files`;
    line = line.replace(
      prMatch[0],
      `<a href="${prUrl}" target="_blank" class="text-blue-600 underline">#${prNumber}</a>`
    );
  }

  return (
    <div
      className="flex-1"
      dangerouslySetInnerHTML={{
        __html: `${index + 1}. ${line}`,
      }}
    />
  );
};

export const CommitItem = ({
  index,
  data,
  isDup,
  isSkip,
  updateToSkip,
  isPick,
  updateToPick
}) => {
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
      className={`px-6 py-3 rounded border border-stone-200 ${isSkip ? ' bg-gray-200' : isDup ? 'bg-yellow-100' : ''}`}
    >
      <div className='flex justify-between items-center'>
        <JiraLine index={index} defaultLine={defaultLine}/>
        {detailLines?.length && JSON.stringify(detailLines) !== '[""]' &&
          <Button type="link" onClick={handleExpand}>
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        }
        <Button type="link" onClick={updateToPick} className={`${isPick ? ' text-red-500' : ''}`}>
          {isPick ? 'Un-Pick' : 'Pick'}
        </Button>
        <Button type="link" onClick={updateToSkip}>
          {isSkip ? 'No-Skip' : 'Skip'}
        </Button>
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
