import { Routes, Route } from 'react-router-dom';
import './App.css';
import Main from "./pages/Main.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Profile from "./pages/Profile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BasicSetting from "./pages/BasicSetting.jsx";
import Investments from './pages/Investments.jsx';
import IncomeExpense from "./pages/IncomeExpense.jsx";
import Overview from "./pages/Overview.jsx";
import CashFlow from './pages/CashFlow.jsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/BasicSetting" element={<BasicSetting />} />
          <Route path="/Investments" element={<Investments />} />
          <Route path="/IncomeExpense" element={<IncomeExpense />} />
          <Route path="/Overview" element={<Overview />} />
          <Route path="/CashFlow" element={<CashFlow />} />
        </Routes>
      </header>
    </div>
  );
}

export default App;