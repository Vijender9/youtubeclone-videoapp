import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config.js";

const Upload = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("accessToken");
//   console.log("accessToken for upload",token);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      alert("Please select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/videos/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Video uploaded successfully!");
      console.log( " response data for upload",response.data);
      Navigate("/upload")
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload video.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Video</label>
          <input
            type="file"
            className="form-control"
            accept="video/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-success">
          Upload Video
        </button>
      </form>
    </div>
  );
};

export default Upload;
