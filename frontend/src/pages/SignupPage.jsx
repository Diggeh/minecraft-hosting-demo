import React from "react";
import iconPerson from "../assets/icon_person.svg";
import iconMail from "../assets/icon_mail.svg";
import iconKey from "../assets/icon_key.svg";
import iconEyeClosed from "../assets/icon_eye_closed.svg";
import "../styles/SignupPage.css";

const SignupPage = () => {
  return (
    <div className="signup-page">
      <div className="signup-title-page">
        <p>Create an account now</p>
      </div>
      <form className="signup-body">
        <p className="signup-body-label">Signup</p>
        <div className="signup-input-container">
          <div className="signup-input-body forty">
            <img src={iconPerson} />
            <input type="text" placeholder="Username" />
          </div>
          <div className="signup-input-body sixty">
            <img src={iconMail} />
            <input type="text" placeholder="Email" />
          </div>
          <div className="signup-input-body wide">
            <img src={iconKey} />
            <input type="password" placeholder="Password" />
            <img src={iconEyeClosed} onClick={null} />
          </div>
          <div className="signup-input-body wide">
            <img src={iconKey} />
            <input type="password" placeholder="Re-enter password" />
            <img src={iconEyeClosed} onClick={null} />
          </div>
          <button className="signup-btn">Sign up</button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
