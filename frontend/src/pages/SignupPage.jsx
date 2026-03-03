import React from "react";
import backgroundImage from "../assets/minecraft-image-2.png";
import iconPerson from "../assets/icon_person.svg";
import iconMail from "../assets/icon_mail.svg";
import iconKey from "../assets/icon_key.svg";
import iconEyeClosed from "../assets/icon_eye_closed.svg";
import "../styles/SignupPage.css";

const SignupPage = () => {
  return (
    <div className="signup-page">
      <div className="title-page">
        <p>Create an account now</p>
      </div>
      <form className="body">
        <p className="body-label">Signup</p>
        <div className="input-row">
          <div className="input-wrapper forty">
            <img src={iconPerson} />
            <input type="text" placeholder="Username" />
          </div>
          <div className="input-wrapper sixty">
            <img src={iconMail} />
            <input type="text" placeholder="Email" />
          </div>
          <div className="input-wrapper wide">
            <img src={iconKey} />
            <input type="password" placeholder="Password" />
            <img src={iconEyeClosed} onClick={null} />
          </div>
          <div className="input-wrapper wide">
            <img src={iconKey} />
            <input type="password" placeholder="Re-enter password" />
            <img src={iconEyeClosed} onClick={null} />
          </div>
          <button className="btn">Sign up</button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
