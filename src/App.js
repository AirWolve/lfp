import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' }); // 부드럽게 스크롤
    }
  }

  return (
    <div className="App">
      <nav className="navBar">
        <a href="#" className="logo">logo</a>
        <ul>
        <li><a href="#home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</a></li>
        <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a></li>
          <li><a href="#">Sign In</a></li>
          <li><a href="#">Trial for Guest</a></li>
        </ul>
      </nav>
      <header className="App-header">
        {/* Background image content */}
        <h1>Welcome to Our Service</h1>
      </header>

      {/* About Section */}
      <section id="about" className="aboutSection">
        <div className="aboutWrapper">
          <div className="aboutLeft">
            <h2>About Life<br />Financial Planning</h2>
          </div>
          <div className="aboutRight">
            <p>
              Welcome to Life Financial Planning – your trusted partner in building a <strong>secure and prosperous</strong> future. 
              We provide personalized financial strategies tailored to your unique goals, whether you're planning for retirement, 
              managing investments, or securing your family's financial well-being. 
              Our expert advisors combine in-depth knowledge with a client-first approach to help you navigate every stage of life with confidence.
              Start your journey toward financial freedom today with Life Financial Planning – where your future is our priority.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
