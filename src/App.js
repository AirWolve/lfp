import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Main from "./pages/Main.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <Router>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/SignIn" element={<SignIn />} />
            <Route path="/SignUp" element={<SignUp />} />
          </Routes>
        </Router>
      </header>
    </div>
  );
}

export default App;