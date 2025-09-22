import {useRef} from 'react';
import { Tooltip } from 'antd';
// import { Copy06, Check } from '@untitled-ui/icons-react';
import {  useState } from 'react';
import copy from 'copy-to-clipboard';

export const CopyCherryCommit = ({ sha }) => {
    const timeoutRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    copy(`git checkout master
git cherry-pick ${sha}`);
    setIsCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Tooltip placement="bottom" title="Copy">
      <div className="hover:bg-coControlItemBgHover relative size-8 rounded bg-transparent p-1" onClick={handleCopy}>
        {!isCopied ? (
          <i className="text-coIcon size-6 cursor-pointer">Copy</i>
        ) : (
          <i className="text-coIcon size-6 cursor-pointer">Done</i>
        )}
      </div>
    </Tooltip>
  );
};
