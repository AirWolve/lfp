import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Main from "./pages/Main.jsx";
import Sign_in from "./pages/Sign_in.jsx";
import Sign_up from "./pages/Sign-up.jsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <Router>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/Sign-in" element={<Sign_in />} />
            <Route path="/Sign-up" element={<Sign_up />} />
          </Routes>
        </Router>
      </header>
    </div>
  );
}

export default App;