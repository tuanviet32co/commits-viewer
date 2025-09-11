import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { FetchForm } from './FetchForm';
import { Button, Spin } from 'antd';
import { CommitItem } from './CommitItem';


const SKIP_DEVELOP = 'SKIP_DEVELOP';
const SKIP_MASTER = 'SKIP_MASTER';

const PICK_DEVELOP = 'PICK_DEVELOP';
const PICK_MASTER = 'PICK_MASTER';

const CommitsViewer = () => {

  const [argsState, setArgsState] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [developCommits, setDevelopCommits] = useState([]);
  const [masterCommits, setMasterCommits] = useState([]);

  const [skipDevelop, setSkipDevelop] = useState(JSON.parse(localStorage.getItem(SKIP_DEVELOP) || "[]"));
  const [skipMaster, setSkipMaster] = useState(JSON.parse(localStorage.getItem(SKIP_MASTER) || "[]"));

  const updateToSkip = (sha, isMaster) => {
    if (isMaster) {
      const newData = skipMaster.includes(sha) ? skipMaster.filter(a => a !== sha) : [...skipMaster, sha];
      setSkipMaster(newData);
      localStorage.setItem(SKIP_MASTER, JSON.stringify(newData));
    } else {
      const newData = skipDevelop.includes(sha) ? skipDevelop.filter(a => a !== sha) : [...skipDevelop, sha];
      setSkipDevelop(newData);
      localStorage.setItem(SKIP_DEVELOP, JSON.stringify(newData));
    }
  }

  const [pickDevelop, setPickDevelop] = useState(JSON.parse(localStorage.getItem(PICK_DEVELOP) || "[]"));
  const [pickMaster, setPickMaster] = useState(JSON.parse(localStorage.getItem(PICK_MASTER) || "[]"));

  const updateToPick = (sha, isMaster) => {
    if (isMaster) {
      const newData = pickMaster.includes(sha) ? pickMaster.filter(a => a !== sha) : [...pickMaster, sha];
      setPickMaster(newData);
      localStorage.setItem(PICK_MASTER, JSON.stringify(newData));
    } else {
      const newData = pickDevelop.includes(sha) ? pickDevelop.filter(a => a !== sha) : [...pickDevelop, sha];
      setPickDevelop(newData);
      localStorage.setItem(PICK_DEVELOP, JSON.stringify(newData));
    }
  }

  const fetchCommits = async (branch, args) => {
    const per_pageVal = `per_page=${args.per_page}`;
    const pageVal = `page=${args.page}`;
    // const sinceVal = args.since ? `&since=${args.since}` : '';
    const queryVal = `?sha=${branch}&${per_pageVal}&${pageVal}`;

    try {
      const response = await axios.get(
        `https://api.github.com/repos/${process.env.REACT_APP_REPOS_PATH}/commits${queryVal}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          },
        }
      );
      return (response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFetchCommits = async (args) => {
    const per_page = Math.min(args.per_page, 100);
    const page_count = args.per_page <= 100 ? 1 : Math.floor(args.per_page / 100);
    setIsLoading(true);
    const [develop, master] = await Promise.all([
      Promise.all([...Array(page_count).keys()].map(i => i + 1).map(n => fetchCommits('develop', { page: n, per_page }))),
      // Promise.all([...Array(page_count).keys()].map(i => i + 1).map(n => fetchCommits('master', { page: n, per_page }))),
      Promise.all([...Array(page_count).keys()].map(i => i + 1).map(n => fetchCommits('deploy/toan-env-from-develop', { page: n, per_page }))),
    ]);
    setIsLoading(false);
    setDevelopCommits(develop.flat());
    setMasterCommits(master.flat());
  };


  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextArgsState = { ...argsState, page: argsState.page + 1 };
    setArgsState(nextArgsState);
    const [develop, master] = await Promise.all([
      fetchCommits('develop', nextArgsState),
      fetchCommits('master', nextArgsState),
    ]);
    setIsLoadingMore(false);
    setDevelopCommits(v => [...v, ...develop]);
    setMasterCommits(v => [...v, ...master]);
  };

  const getUniqueCommitsSha = (commits1, commits2) => {
    const commitDetails2 = commits2.map(commit => ({
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
    }));

    return commits1
      .filter(commit1 => {
        const commit1Details = {
          message: commit1.commit.message,
          author: commit1.commit.author.name,
          date: commit1.commit.author.date,
        };

        return !commitDetails2.some(
          commit2 =>
            commit2.message === commit1Details.message &&
            commit2.author === commit1Details.author &&
            new Date(commit2.date).getTime() === new Date(commit1Details.date).getTime()
        );
      })
      .map(v => v.sha);
  };

  const [uniqueDevelopCommitsSha, uniqueMasterCommitsSha] = useMemo(() => {
    const d = getUniqueCommitsSha(developCommits, masterCommits);
    const m = getUniqueCommitsSha(masterCommits, developCommits);
    return [d, m];
  }, [developCommits, masterCommits]);

  const develops = useMemo(() => {
    return developCommits.map((v) => {
      return {
        ...v,
        isDup: uniqueDevelopCommitsSha.includes(v.sha),
      }
    });
  }, [developCommits, uniqueDevelopCommitsSha]);

  const masters = useMemo(() => {
    return masterCommits.map((v) => {
      return {
        ...v,
        isDup: uniqueMasterCommitsSha.includes(v.sha),
      }
    });
  }, [masterCommits, uniqueMasterCommitsSha]);

  return (
    <div className="p-4">
      <div className='py-8 flex items-center w-full'>
        <FetchForm onSummit={handleFetchCommits} />
        <Spin spinning={isLoading} />
      </div>
      <div className="flex space-x-4">
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-2">Dev Branch</h2>
          <ul className="list-disc pl-5 space-y-4">
            {develops.map((commit, index) => (
              <CommitItem
                index={index}
                key={commit.sha}
                data={commit.commit.message}
                isDup={commit.isDup}
                isSkip={skipDevelop.includes(commit.sha)}
                updateToSkip={() => updateToSkip(commit.sha, false)}
                isPick={pickDevelop.includes(commit.sha)}
                updateToPick={() => updateToPick(commit.sha, false)}
              />
            ))}
          </ul>
        </div>
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-2">Master Branch</h2>
          <ul className="list-disc pl-5 space-y-4">
            {masters.map((commit, index) => (
              <CommitItem
                index={index}
                key={commit.sha}
                data={commit.commit.message}
                isDup={commit.isDup}
                isSkip={skipMaster.includes(commit.sha)}
                updateToSkip={() => updateToSkip(commit.sha, true)}
                isPick={pickMaster.includes(commit.sha)}
                updateToPick={() => updateToPick(commit.sha, true)}
              />
            ))}
          </ul>
        </div>
      </div>
      {develops.length > 0 &&
        <div className='flex justify-center items-center p-6'>
          <Button loading={isLoadingMore} onClick={handleLoadMore}>Load more</Button>
        </div>}
    </div>
  );
};

export default CommitsViewer;
