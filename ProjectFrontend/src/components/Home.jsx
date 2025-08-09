
import axios from "axios";
import { API_BASE_URL } from "../config.js";
import React, { useEffect, useState } from "react";
import VideoCard from "./VideoCard";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log("Fetching videos...");
        const response = await axios.get(`${API_BASE_URL}/api/v1/videos/getVideos`);
        console.log("check thumbnail :",response.data);

        if (response.data && Array.isArray(response.data.data)) {
          setVideos(response.data.data);
          console.log("Videos fetched successfully!");
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        setError("Failed to load videos. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="container mt-4">
      {/* Page Title */}
      <h2 className="text-center mb-4">Latest Videos</h2>

      {/* Loading State */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : videos.length > 0 ? (
        // Responsive Grid Layout
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
          {videos.map((video) => (
            <div key={video._id} className="col">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">No videos available.</p>
      )}
    </div>
  );
};

export default Home;
