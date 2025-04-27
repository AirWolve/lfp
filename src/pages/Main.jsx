import React from "react";
import "./Main.css";
import { constPath } from "../config.js";

const Main = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" }); // Smooooooooth Scroll
    }
  };
  return (
    <div className="App">
      <nav className="navBar">
        <button className="logo">logo</button>
        <ul>
          <li>
            <button
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("home");
              }}
            >
              Home
            </button>
          </li>

          <li>
            <button
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("about");
              }}
            >
              About
            </button>
          </li>
          <li>
            <a href={`${constPath.signIn}`}>Sign In</a>
          </li>
          <li>
            <a href={`${constPath.trialForGuest}`}>Trial for Guest</a>
          </li>
        </ul>
      </nav>

      {/* Main Section */}
      <div id="home" className="mainHeader">
        <h1>Welcome to Our Service</h1>
      </div>

      {/* About Section (Revised) */}
      <section id="about" className="aboutSection">
        <div className="aboutWrapper">
          <div className="aboutLeft">
            <h2>
              About Life
              <br />
              Financial Planning
            </h2>
          </div>
          <div className="aboutRight">
            <p>
              Welcome to Life Financial Planning – your trusted partner in
              building a <strong>secure and prosperous</strong> future. We
              provide personalized financial strategies tailored to your unique
              goals, whether you're planning for retirement, managing
              investments, or securing your family's financial well-being. Our
              expert advisors combine in-depth knowledge with a client-first
              approach to help you navigate every stage of life with confidence.
              Start your journey toward financial freedom today with Life
              Financial Planning – where your future is our priority.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Main;
