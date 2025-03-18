import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Main from "./pages/Main.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";

function App() {
  const buildType = process.env.REACT_APP_BUILD_TYPE;
  const branch = process.env.REACT_APP_BRANCH;
  // test 빌드인 경우 브랜치 이름을 basename으로 사용, 그렇지 않으면 기본 '/'
  const basename = buildType === 'test' && branch ? `/${branch}` : "/";

  return (
    <div className="App">
      <header className="App-header">
      <Router basename={basename}>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="SignIn" element={<SignIn />} />
            <Route path="SignUp" element={<SignUp />} />
          </Routes>
        </Router>
      </header>
    </div>
  );
}

export default App;