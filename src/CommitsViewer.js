import React, { useState } from 'react';
import axios from 'axios';

const CommitsViewer = () => {
  const [developCommits, setDevelopCommits] = useState([]);
  const [masterCommits, setMasterCommits] = useState([]);

  const fetchCommits = async (branch, setCommits) => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${process.env.REACT_APP_REPOS_PATH}/commits?sha=${branch}&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          },
        }
      );
      setCommits(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFetchCommits = () => {
    fetchCommits('develop', setDevelopCommits);
    fetchCommits('master', setMasterCommits);
  };

  const getUniqueCommits = (commits1, commits2) => {
    const commitDetails2 = commits2.map(commit => ({
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
    }));
  
    return commits1.filter(commit1 => {
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
    });
  };
  
  const uniqueDevelopCommits = getUniqueCommits(developCommits, masterCommits);
  const uniqueMasterCommits = getUniqueCommits(masterCommits, developCommits);

  return (
    <div className="p-4">
      <button
        className="mb-4 p-2 bg-blue-500 text-white rounded"
        onClick={handleFetchCommits}
      >
        Fetch Commits
      </button>
      <div className="flex space-x-4">
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-2">Dev Branch</h2>
          <ul className="list-disc pl-5 space-y-2">
            {developCommits.map(commit => (
              <li
                key={commit.sha}
                className={`p-2 rounded ${
                  uniqueDevelopCommits.includes(commit) ? 'bg-yellow-200' : ''
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
                className={`p-2 rounded ${
                  uniqueMasterCommits.includes(commit) ? 'bg-lightblue-200' : ''
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
