import { useEffect, useMemo, useState } from 'react';
import { Button } from 'antd';
import { SyncSelect } from './SyncSelect';
import { CommitItem } from './CommitItem';
import { CopyCherryCommitList } from './CopyCherryCommitList';

export const BranchItem = ({
  updateToSkip,
  updateToPick,
  branch,
  setBranch,
  commits,
  skipList,
  pickList,
  storageKey,
  hasError,
  targetBranch,
  isMaster,
}) => {
  const [selectedCommitIndexs, setSelectedCommitIndexs] = useState([]);

  useEffect(() => {
    // Clear selected commits when branch or commits change
    setSelectedCommitIndexs([]);
  }, [branch, commits]);

  const shaList = useMemo(() => {
    return selectedCommitIndexs.sort((a, b) => b - a).map((index) => commits[index]?.sha).filter(Boolean);
  }, [selectedCommitIndexs, commits]);

  const handleCheckboxClick = (e) => {
    if (e.nativeEvent.shiftKey && selectedCommitIndexs.length > 0 && e.target.checked) {
      const lastIndex = selectedCommitIndexs[selectedCommitIndexs.length - 1];
      const [start, end] = [Math.min(lastIndex, index), Math.max(lastIndex, index)];
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      setSelectedCommitIndexs((prev) => {
        // union of old selection + new range
        const merged = new Set([...prev, ...range]);
        return Array.from(merged);
      });
    } else {
      if (e.target.checked) {
        setSelectedCommitIndexs((prev) => [...prev, index]);
      } else {
        setSelectedCommitIndexs((prev) => prev.filter((ii) => ii !== index));
      }
    }
  }

  return (
    <div key={storageKey}>
      <div className="flex items-center space-x-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Branch: </h2>
        <SyncSelect
          value={branch}
          setValue={setBranch}
          storageValueKey={storageKey}
          defaultReposOptions={['develop', 'master']}
          className='w-96'
        />
        {shaList.length > 0 &&
          <div className='flex justify-end items-center gap-2 flex-1'>
            <div>Selected <b>{shaList.length}</b> commits</div>
            <Button type="link" onClick={() => setSelectedCommitIndexs([])}>Reset</Button>
            <CopyCherryCommitList shaList={shaList} targetBranch={targetBranch} />
          </div>
        }
      </div>
      <br />
      {hasError && <div className='mb-4 text-red-500'>Error fetching commits for this branch. Please check the branch name or your network connection.</div>}
      <ul className="list-disc pl-5 space-y-4">
        {commits.map((commit, index) => (
          <CommitItem
            key={commit.sha}
            sha={commit.sha}
            index={index}
            data={commit.commit.message}
            isDup={commit.isDup}
            isSkip={skipList.includes(commit.sha)}
            updateToSkip={() => updateToSkip(commit.sha, isMaster)}
            isPick={pickList.includes(commit.sha)}
            updateToPick={() => updateToPick(commit.sha, isMaster)}
            targetBranch={targetBranch}
            isSelected={selectedCommitIndexs.includes(index)}
            onCheckboxChange={handleCheckboxClick}
          />
        ))}
      </ul>
    </div>);
};
