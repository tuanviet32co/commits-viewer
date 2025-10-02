import { useRef } from 'react';
import { Tooltip, Button } from 'antd';
import { useState } from 'react';
import copy from 'copy-to-clipboard';

export const CopyCherryCommitList = ({ shaList, targetBranch }) => {
  const timeoutRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const cherryPickCmd = shaList.join(" ");

    copy(`git checkout ${targetBranch}
git cherry-pick ${cherryPickCmd}`);

    setIsCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Tooltip placement="bottom" title={<span>Copy cherry-pick command to branch <b>{targetBranch}</b></span>}>
      <Button type="link" onClick={handleCopy}>
        {isCopied ? 'Copied' : 'Copy'}
      </Button>
    </Tooltip>
  );
};
