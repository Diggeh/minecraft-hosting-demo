import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";

const Profile = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div>
      <button onClick={logout}>
        <Link to="/">Logout and return</Link>
      </button>
    </div>
  );
};

export default Profile;
