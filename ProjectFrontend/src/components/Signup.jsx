import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom"; // Ensure navigation works

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    avatar: null,
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      setFormData({ ...formData, avatar: file });

      // Show preview of the selected avatar
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewAvatar(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullname", formData.fullname);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("username", formData.username);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("avatar", formData.avatar);

      const response = await axios.post(`${API_BASE_URL}/api/v1/users/register`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Signup Response:", response);
      setMessage("User registered successfully!");

      // Clear form fields after success
      setFormData({
        fullname: "",
        email: "",
        username: "",
        password: "",
        avatar: null,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data.message || "Error signing up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: "#f9f9f9" }}>
      <div className="card shadow-sm p-4" style={{ width: "350px", fontSize: "14px" }}>
        <h3 className="text-center mb-3" style={{ fontSize: "18px" }}>Create Account</h3>
        {message && <p className="text-center text-danger" style={{ fontSize: "12px" }}>{message}</p>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-2">
            <label className="form-label">Full Name</label>
            <input type="text" name="fullname" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-2">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-2">
            <label className="form-label">Username</label>
            <input type="text" name="username" className="form-control" onChange={handleChange} required />
          </div>

          <div className="mb-2">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" onChange={handleChange} required />
          </div>

          {/* Avatar Upload with Preview */}
          <div className="mb-3">
            <label className="form-label">Avatar</label>
            <input type="file" name="avatar" className="form-control" accept="image/*" onChange={handleChange} required />
            {previewAvatar && (
              <img src={previewAvatar} alt="Avatar Preview" className="mt-2 rounded-circle" style={{ width: "50px", height: "50px" }} />
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
