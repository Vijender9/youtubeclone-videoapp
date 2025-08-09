import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config.js";

const MyUploads = () => {
  const [videos, setVideos] = useState([]);
  const token = localStorage.getItem("accessToken"); // Get the token from local storage
  console.log("token for my upload:",token)
  

  useEffect(() => {
    const fetchMyVideos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/videos/my-uploads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("response for my uploads",response.data);
        setVideos(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchMyVideos();
  }, [token]);  // Re-fetch if token changes

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/v1/videos/delete-video/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos((prevVideos) => prevVideos.filter((video) => video._id !== videoId));
      alert("Video deleted successfully!");
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div className="container mt-4">
    <h2 className="text-center mb-4">My Uploaded Videos</h2>
    <div className="row">
      {videos.length > 0 ? (
        videos.map((video) => (
          <div key={video._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow">
              <video className="card-img-top" controls>
                <source src={video.videoFile} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="card-body d-flex justify-content-between align-items-center">
                <h5 className="card-title">{video.title}</h5>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(video._id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center">No videos uploaded yet.</p>
      )}
    </div>
  </div>
  );
};

export default MyUploads;
