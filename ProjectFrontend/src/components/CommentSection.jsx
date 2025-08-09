import axios from 'axios';
import { API_BASE_URL } from "../config.js";
import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from "date-fns";
import { FaTrash } from "react-icons/fa"; // Import trash icon

const CommentSection = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/comments/${videoId}`);
        console.log("Fetched comments:", res);
        setComments(res.data.data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [videoId]);

  // Function to handle new comment submission
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/comments/`,
        { videoId, text: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Comment added:", res.data);
      console.log("checking commenting username:",res.data.data.userId.username);
      setComments([...comments, res.data.data]); // Append new comment
      setNewComment(""); // Clear input field
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    const token = localStorage.getItem("accessToken");

    try {
      await axios.delete(`${API_BASE_URL}/api/v1/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments(comments.filter((comment) => comment._id !== commentId)); // Remove from UI
      console.log("Comment deleted:", commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="comment-section" style={{ maxWidth: "600px", margin: "20px auto", padding: "10px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}>
      <h3>Comments</h3>

      {/* Comment Input */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          style={{ flex: "1", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleCommentSubmit}
          disabled={loading}
          style={{
            padding: "8px 15px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Comment List */}
      {comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid #eee" }}>
            <div>
            <small style={{ color: "#777" }}>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </small>
              <p>
               
                <strong>{comment.userId?.username || "Anonymous"} 
                    </strong>
                  : {comment.text}
              </p>
             
            </div>
            <FaTrash
              onClick={() => handleDeleteComment(comment._id)}
              style={{ cursor: "pointer", color: "red", marginLeft: "10px" }}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default CommentSection;
