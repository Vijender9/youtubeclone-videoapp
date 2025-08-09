import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import VideoDetails from "./components/VideoDetails";
import Upload from "./components/Upload";
import Sidebar from "./components/Sidebar";
import MyUploads from "./components/MyUploads";
import WatchHistory from "./components/WatchHistory";
import { API_BASE_URL } from "./config";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data from the backend
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/current-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("user at app components:",response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Sidebar user={user} setUser={setUser} />
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/video/:id" element={<VideoDetails />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/my-uploads" element={<MyUploads />} />
            <Route path="/watch-history" element={<WatchHistory />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
