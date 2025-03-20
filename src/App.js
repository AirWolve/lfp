import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import basename from "./config.js"
import Main from "./pages/Main.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";

function App() {
  console.log(basename);

  return (
    <div className="App">
      <header className="App-header">
      <Router>
          <Routes>
            <Route path={`${basename}`} element={<Main />} />
            <Route path={`${basename}/SignIn`} element={<SignIn />} />
            <Route path={`${basename}/SignUp`} element={<SignUp />} />
          </Routes>
        </Router>
      </header>
    </div>
  );
}


export default App;