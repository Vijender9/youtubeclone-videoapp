import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config.js";
import "./Sidebar.css";

const Sidebar = ({ user, setUser }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("/default-avatar.png");
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const username = localStorage.getItem("username");

  console.log("Current user:", user);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/current-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedUser = response.data.data;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setPreview(updatedUser.avatar || "/default-avatar.png");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (token) {
      fetchUserData(); // Fetch user data if token is available
    } else {
      setUser(null);
      setPreview("/default-avatar.png");
    }
  }, [setUser, token]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file!");
    const formData = new FormData();
    formData.append("avatar", selectedFile);
    try {
      await axios.patch(`${API_BASE_URL}/api/v1/users/update-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedFile(null); // Reset file selection after upload
      const response = await axios.get(`${API_BASE_URL}/api/v1/users/current-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = response.data.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setPreview(updatedUser.avatar || "/default-avatar.png");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      alert("Failed to update profile picture.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setSelectedFile(null);
    setPreview("/default-avatar.png");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="profile-section">
        {user ? (
          <>
            <div className="avatar-container">
              <img src={preview} alt="Profile" className="profile-picture" />
              <label className="upload-label">
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                Update Profile
              </label>
              {selectedFile && (
                <button className="upload-btn" onClick={handleUpload}>
                  Upload
                </button>
              )}
            </div>
            <h3 className="username">{username || "Guest"}</h3>
          </>
        ) : (
          <>
            <img src="https://robohash.org/default-avatar.png" alt="Default Profile" className="profile-picture" />
            <h3 className="username">Guest</h3>
            <Link to="/login">
              <button className="login-btn">Login</button>
            </Link>
          </>
        )}
      </div>

      <ul className="sidebar-links">
        <li>
          <Link to="/">🏠 Home</Link>
        </li>
         { !user && (

            <li>
              <Link to="/signup">📝 Signup</Link>
            </li>
      
    
  )}
        {user && (
          <>
            <li>
              <Link to="/my-uploads">📁 Uploaded Videos</Link>
            </li>
            <li>
              <Link to="/upload">⬆️ Upload Video</Link>
            </li>
            <li>
          <Link to="/watch-history">📜 Watch History</Link>
        </li>
          </>
        )}
       
    </ul>

      {
    user && (
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    )
  }
    </div >
  );
};

export default Sidebar;
