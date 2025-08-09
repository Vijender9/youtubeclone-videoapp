import axios from "axios"; 
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import CommentSection from "./CommentSection.jsx";
import SubscribeButton from "./SubscribeButton.jsx";
import "./VideoDetails.css";

const VideoDetails = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [channelUser, setChannelUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [views, setViews] = useState(0); // Track views in state

  const token = localStorage.getItem("accessToken");
  console.log("id is :", id);

  // Fetch video details
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/v1/videos/getVideo-single/${id}`)
      .then((response) => {
        console.log("Video response:", response.data);
        setVideo(response.data);
        setChannelUser(response.data.owner);
        setViews(response.data.views); // Set initial views count
      })
      .catch((error) => console.error("Error fetching video:", error));
  }, [id]);

  // Fetch subscriber count
  useEffect(() => {
    if (!channelUser) return;

    axios
      .get(`${API_BASE_URL}/api/v1/subscriptions/subscribers/count/${channelUser._id}`)
      .then((response) => {
        console.log("Subscriber count:", response.data.subscribersCount);
        setSubscriberCount(response.data.subscribersCount);
      })
      .catch((error) => console.error("Error fetching subscriber count:", error));
  }, [channelUser]);

  // Increase views when video is watched
  useEffect(() => {
    console.log("useEffect for increasing views is running");
    const increaseView = async () => {
      try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/videos/views/${id}`);
        console.log("View increased:", response.data);
        setViews((prevViews) => prevViews + 1); // Update views count
      } catch (error) {
        console.error("Error increasing views:", error);
      }
    };

    increaseView();
  }, [id]);

  // Store Watch History when Video is Watched
  useEffect(() => {
    if (!token || !id) return;

    const storeWatchHistory = async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/api/v1/users/store-history`,
          { videoId: id },
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
        console.log("Watch history updated successfully");
      } catch (error) {
        console.error("Error updating watch history:", error);
      }
    };

    storeWatchHistory();
  }, [id, token]);

  // Handle Like
  const handleLike = async () => {
    if (!token) return alert("Please log in to like the video!");
    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/videos/like/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      setIsLiked(true);
      setIsDisliked(false);
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  // Handle Dislike
  const handleDislike = async () => {
    if (!token) return alert("Please log in to dislike the video!");
    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/videos/dislike/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setIsLiked(false);
      setIsDisliked(true);
    } catch (error) {
      console.error("Error disliking video:", error);
    }
  };

  if (!video) return <p>Loading...</p>;

  return (
    <div className="video-page">
      {/* Video Player */}
      <div className="video-container">
        <video className="video-player" controls>
          <source src={video.videoFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Info */}
      <h1 className="video-title">{video.title}</h1>

      {/* Channel & Actions */}
      <div className="video-actions">
        {/* Channel Info */}
        <div className="channel-info">
          <img
            src={channelUser?.avatar || "/default-avatar.png"}
            alt={channelUser?.username}
            className="channel-avatar"
          />
          <div>
            <h4 className="channel-name">{channelUser?.username}</h4>
            <p className="channel-subscribers">{subscriberCount} subscribers</p>
          </div>
        </div>

        {/* Like, Dislike, Subscribe */}
        <div className="action-buttons">
          <button className={`like-button ${isLiked ? "liked" : ""}`} onClick={handleLike}>
            👍 {isLiked ? "Liked" : "Like"}
          </button>
          <button className={`dislike-button ${isDisliked ? "disliked" : ""}`} onClick={handleDislike}>
            👎 {isDisliked ? "Disliked" : "Dislike"}
          </button>

          {/* Subscribe Button Component */}
          {channelUser && <SubscribeButton channelUserId={channelUser?._id} username={channelUser?.username}
           onSubscriptionChange={(count)=>setSubscriberCount(count)}
          />}
        </div>
      </div>

      {/* Video Description */}
      <div className="video-description">
        <p className="video-views">{views} views</p> {/* Display views count */}
        <p>{video.description}</p>
      </div>

      {/* Comments */}
      <CommentSection videoId={id} />
    </div>
  );
};

export default VideoDetails;
