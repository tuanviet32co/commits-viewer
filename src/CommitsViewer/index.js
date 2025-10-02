import { useMemo, useState } from 'react';
import axios from 'axios';
import { Button, Spin,  Select } from 'antd';
import { CommitItem } from './CommitItem';
import { SyncSelect } from './SyncSelect';

const REPOS = 'REPOS';
const defaultReposOptions = [
  'frontend',
  'virtualsmile',
  'hy-genius',
];

const PER_PAGE = 'PER_PAGE';
const BRANCH1 = 'BRANCH1';
const BRANCH2 = 'BRANCH2';

const SKIP_DEVELOP = 'SKIP_DEVELOP';
const SKIP_MASTER = 'SKIP_MASTER';

const PICK_DEVELOP = 'PICK_DEVELOP';
const PICK_MASTER = 'PICK_MASTER';

const CommitsViewer = () => {
  const [repos, setRepos] = useState(localStorage.getItem(REPOS) || 'frontend');

  const [branch1, setBranch1] = useState(localStorage.getItem(BRANCH1) || 'develop');
  const [branch2, setBranch2] = useState(localStorage.getItem(BRANCH2) || 'develop');

  const [argsState, setArgsState] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [branch1Commits, setBranch1Commits] = useState([]);
  const [branch2Commits, setBranch2Commits] = useState([]);

  const [skipDevelop, setSkipDevelop] = useState(JSON.parse(localStorage.getItem(SKIP_DEVELOP) || "[]"));
  const [skipMaster, setSkipMaster] = useState(JSON.parse(localStorage.getItem(SKIP_MASTER) || "[]"));

  const [perPage, setPerPage] = useState(JSON.parse(localStorage.getItem(PER_PAGE) || '100'));

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
    const queryVal = `?sha=${branch}&${per_pageVal}&${pageVal}`;

    try {
      const response = await axios.get(
        `https://api.github.com/repos/32S-Dental/${repos}/commits${queryVal}`,
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

  const [branch1Error, setBranch1Error] = useState(false);
  const [branch2Error, setBranch2Error] = useState(false);

  const handleFetchCommits = async () => {
    const per_page = Math.min(perPage, 100);
    const page_count = perPage <= 100 ? 1 : Math.floor(perPage / 100);
    setIsLoading(true);
    setBranch1Error(false);
    setBranch2Error(false);
    const [branch1CommitRes, branch2CommitRes] = await Promise.all([
      Promise.allSettled([...Array(page_count).keys()].map(i => i + 1).map(n => fetchCommits(branch1, { page: n, per_page }))),
      Promise.allSettled([...Array(page_count).keys()].map(i => i + 1).map(n => fetchCommits(branch2, { page: n, per_page }))),
    ]);
    setIsLoading(false);
    if (branch1CommitRes.some(v => v.status === 'rejected' || v.value === undefined)) {
      setBranch1Error(true);
    } else {
      setBranch1Commits(branch1CommitRes.map(v => v?.value).flat());
    }

    if (branch2CommitRes.some(v => v.status === 'rejected' || v.value === undefined)) {
      setBranch2Error(true);
    } else {
      setBranch2Commits(branch2CommitRes.map(v => v?.value).flat());
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextArgsState = { ...argsState, page: argsState.page + 1 };
    setArgsState(nextArgsState);
    const [branch1MoreCommit, branch2MoreCommit] = await Promise.all([
      fetchCommits(branch1, nextArgsState),
      fetchCommits(branch2, nextArgsState),
    ]);
    setIsLoadingMore(false);
    setBranch1Commits(v => [...v, ...branch1MoreCommit]);
    setBranch2Commits(v => [...v, ...branch2MoreCommit]);
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
    const d = getUniqueCommitsSha(branch1Commits, branch2Commits);
    const m = getUniqueCommitsSha(branch2Commits, branch1Commits);
    return [d, m];
  }, [branch1Commits, branch2Commits]);

  const branch1NetCommits = useMemo(() => {
    return branch1Commits.map((v) => {
      return {
        ...v,
        isDup: uniqueDevelopCommitsSha.includes(v.sha),
      }
    });
  }, [branch1Commits, uniqueDevelopCommitsSha]);

  const branch2NetCommits = useMemo(() => {
    return branch2Commits.map((v) => {
      return {
        ...v,
        isDup: uniqueMasterCommitsSha.includes(v.sha),
      }
    });
  }, [branch2Commits, uniqueMasterCommitsSha]);

  return (
    <div className="p-4">
      <div className='py-8 flex items-center w-full gap-4'>
        <div>Repos:</div>
        <SyncSelect
          value={repos}
          setValue={setRepos}
          storageValueKey={REPOS}
          defaultReposOptions={defaultReposOptions}
          className='w-96'
        />
        <div>Per Page:</div>
        <Select
          value={perPage}
          onChange={(val) => {
            setPerPage(val);
            localStorage.setItem(PER_PAGE, val);
          }}
          options={[
            { value: 100, label: 100 },
            { value: 200, label: 200 },
            { value: 300, label: 300 },
            { value: 400, label: 400 },
            { value: 500, label: 500 },
            { value: 700, label: 700 },
          ]}
          className='w-20'
        />
        <Button type="primary" onClick={handleFetchCommits} >
          Submit
        </Button>
        <Spin spinning={isLoading} />
      </div>
      <div className="flex space-x-4">
        {[
          {
            branch: branch1,
            setBranch: setBranch1,
            commits: branch1NetCommits,
            skipList: skipDevelop,
            pickList: pickDevelop,
            storageKey: BRANCH1,
            hasError: branch1Error,
            isMaster: false
          }, {
            branch: branch2,
            setBranch: setBranch2,
            commits: branch2NetCommits,
            skipList: skipMaster,
            pickList: pickMaster,
            storageKey: BRANCH2,
            hasError: branch2Error,
            isMaster: true
          }].map((v) =>
          (<div className="w-1/2" key={v.storageKey}>
            <div className="flex items-center space-x-4 mb-4">
              <h2 className="text-xl font-semibold mb-2">Branch: </h2>
              <SyncSelect
                value={v.branch}
                setValue={v.setBranch}
                storageValueKey={v.storageKey}
                defaultReposOptions={['develop', 'master']}
                className='w-96'
              />  
            </div>
            {v.hasError && <div className='mb-4 text-red-500'>Error fetching commits for this branch. Please check the branch name or your network connection.</div>}
            <ul className="list-disc pl-5 space-y-4">
              {v.commits.map((commit, index) => (
                <CommitItem
                  key={commit.sha}
                  sha={commit.sha}
                  index={index}
                  data={commit.commit.message}
                  isDup={commit.isDup}
                  isSkip={v.skipList.includes(commit.sha)}
                  updateToSkip={() => updateToSkip(commit.sha, false)}
                  isPick={v.pickList.includes(commit.sha)}
                  updateToPick={() => updateToPick(commit.sha, false)}
                />
              ))}
            </ul>
          </div>
          ))}
      </div>
      {branch1NetCommits.length > 0 &&
        <div className='flex justify-center items-center p-6'>
          <Button loading={isLoadingMore} onClick={handleLoadMore}>Load more</Button>
        </div>}
    </div>
  );
};

export default CommitsViewer;
