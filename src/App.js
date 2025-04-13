import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import Main from "./pages/Main.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Profile from "./pages/Profile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BasicSetting from "./pages/BasicSetting.jsx";
import Investments from "./pages/Investments.jsx";
import InvestmentType from "./pages/InvestmentType.jsx";
import EventSeries from "./pages/EventSeries.jsx";
import IncomeExpense from "./pages/IncomeExpense.jsx";
import Overview from "./pages/Overview.jsx";
import CashFlow from "./pages/CashFlow.jsx";
import LoadingPage from "./pages/LoadingPage.jsx";

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
          <Route path="/InvestmentType" element={<InvestmentType />} />
          <Route path="/EventSeries" element={<EventSeries />} />
          <Route path="/IncomeExpense" element={<IncomeExpense />} />
          <Route path="/Overview" element={<Overview />} />
          <Route path="/CashFlow" element={<CashFlow />} />
          <Route path="/LoadingPage" element={<LoadingPage />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          stacked={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </header>
    </div>
  );
}

export default App;
