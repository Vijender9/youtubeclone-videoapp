import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is imported
import { FaTrash } from "react-icons/fa"; // Trash icon for delete button

const WatchHistory = () => {
  const [watchHistory, setWatchHistory] = useState([]);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const fetchWatchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/users/watch-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchHistory(response.data.data);
    } catch (error) {
      console.error("Error fetching watch history:", error);
    }
  };

  // Delete Single Video from Watch History
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to remove this video from watch history?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/users/watch-history/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchHistory(watchHistory.filter((video) => video._id !== videoId));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  // Clear Entire Watch History
  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your entire watch history?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/users/watch-history/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("response after clear all history:", response)
      setWatchHistory([]);
    } catch (error) {
      console.error("Error clearing watch history:", error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Watch History</h2>
        {watchHistory.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={handleClearHistory}>
            Clear History
          </button>
        )}
      </div>

      {!watchHistory || !Array.isArray(watchHistory) || watchHistory.length === 0 ? (
        <p className="text-center text-muted">No videos watched yet.</p>
      ) : (
        <div className="row">
          {watchHistory.map((video) => (
            <div key={video._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm border-0 rounded position-relative">
                <Link to={`/video/${video._id}`} className="text-decoration-none">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="card-img-top rounded-top"
                    style={{ height: "150px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title text-dark">{video.title}</h5>
                    <p className="card-text text-muted small">
                      By <span className="fw-semibold">{video.owner[0]?.username || "Unknown"}</span>
                    </p>
                  </div>
                </Link>
                {/* Delete Button on Top Right */}
                <button
                  className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2"
                  onClick={() => handleDeleteVideo(video._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
