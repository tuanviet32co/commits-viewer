import React, { useState } from 'react';
import axios from 'axios';
import { FetchForm } from './FetchForm';
import { Spin } from 'antd';

const CommitsViewer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [developCommits, setDevelopCommits] = useState([]);
  const [masterCommits, setMasterCommits] = useState([]);

  const fetchCommits = async (branch, args) => {
    const per_pageVal = `per_page=${args.per_page}`;
    const sinceVal = args.since ? `&since=${args.since}` : '';
    const queryVal = `?sha=${branch}&${per_pageVal}${sinceVal}`;

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
    setIsLoading(true);
    const [develop, master] = await Promise.all([
      fetchCommits('develop', args),
      fetchCommits('master', args),
    ]);
    setIsLoading(false);
    setDevelopCommits(develop);
    setMasterCommits(master);
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

  const uniqueDevelopCommitsSha = getUniqueCommitsSha(developCommits, masterCommits);
  const uniqueMasterCommitsSha = getUniqueCommitsSha(masterCommits, developCommits);

  return (
    <div className="p-4">
      <div className='py-8 flex items-center w-full'>
        <FetchForm onSummit={handleFetchCommits} />
        <Spin spinning={isLoading} />
      </div>
      <div className="flex space-x-4">
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-2">Dev Branch</h2>
          <ul className="list-disc pl-5 space-y-2">
            {developCommits.map(commit => (
              <li
                key={commit.sha}
                className={`p-2 rounded ${uniqueDevelopCommitsSha.includes(commit.sha) ? 'bg-yellow-200' : ''
                  }`}
              >
                {commit.commit.message}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-2">Master Branch</h2>
          <ul className="list-disc pl-5 space-y-2">
            {masterCommits.map(commit => (
              <li
                key={commit.sha}
                className={`p-2 rounded ${uniqueMasterCommitsSha.includes(commit.sha) ? 'bg-blue-200' : ''
                  }`}
              >
                {commit.commit.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommitsViewer;
