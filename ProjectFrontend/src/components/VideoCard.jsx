import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import './VideoCard.css'

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const getTimeAgo = (dateString) => {
  if (!dateString) return "Unknown";
  return formatDistanceToNowStrict(new Date(dateString), { addSuffix: true });
};

const VideoCard = ({ video }) => {
  return (
    <Link to={`/video/${video._id}`} className="text-decoration-none text-dark">
      <div className="video-card">
        {/* Video Thumbnail */}
        <div className="thumbnail-container">
          <img
            src={video.thumbnail || "/default-thumbnail.png"}
            alt={video.title}
            onError={(e) => {
              if (e.target.src !== "/default-thumbnail.png") {
                e.target.src = "/default-thumbnail.png";
              }
            }}
          />
          <span className="duration">{formatDuration(video.duration)}</span>
         
        </div>

        {/* Video Info */}
        <div className="video-info">
          {/* Channel Image */}

           <div className="video-title">
            <img
          src={video.owner?.avatar || "/default-avatar.png"}
            
            alt={video.videoFile}
            className="channel-avatar"
            onError={(e) => {
              if (e.target.src !== "/default-avatar.png") {
                e.target.src = "/default-avatar.png";
              }
            }}
            
            
          />
             <h6 title={video.title} className="video-title-text">
              {video.title}
            </h6>

           </div>
          

          {/* Video Details */}
          <div className="text-content">
            {/* <h6 title={video.title} className="video-title">
              {video.title}
            </h6> */}
            <p className="channel-name">{video.owner?.username}</p>
            <p className="video-meta">
              {video.views} views • {getTimeAgo(video.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
