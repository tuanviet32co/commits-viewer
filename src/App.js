import CommitsViewer from './CommitsViewer';

function App() {
  return (
    <div className="App">
      <header className="App-header w-full flex items-center justify-center mt-8">
        <div className='text-red-500 font-semibold text-2xl'>Commit Viewer</div>
      </header>
      <CommitsViewer />
    </div>
  );
}

export default App;
