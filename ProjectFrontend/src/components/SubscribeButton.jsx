import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { FaBell } from "react-icons/fa"; // Import bell icon

const SubscribeButton = ({ channelUserId, username,onSubscriptionChange }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [hover, setHover] = useState(false); // Fix: Add hover state

  // here i guess i need tofetch subscriber count so aynamically i can display those
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");

  console.log("User ID in frontend:", userId);
  console.log("Channel User ID:", channelUserId);

  useEffect(() => {
    if (!userId || !channelUserId) return;

    // Check if the user is subscribed
    axios
      .get(`${API_BASE_URL}/api/v1/subscriptions/isSubscribed/${userId}/${channelUserId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        console.log("Response for isSubscribed:", response);
        setSubscribed(response.data.isSubscribed);
      })
      .catch((error) => console.error("Error checking subscription status:", error));
  }, [channelUserId, userId, accessToken]);

  const handleSubscription = async () => {
    if (!userId) {
      alert("Please log in to subscribe!");
      return;
    }

    const action = subscribed ? "unsubscribe" : "subscribe";
    const method = subscribed ? "delete" : "post";

    try {
      await axios({
        method,
        url: `${API_BASE_URL}/api/v1/subscriptions/${action}/${username}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setSubscribed(!subscribed);
        
    const res= await axios.get(`${API_BASE_URL}/api/v1/subscriptions/subscribers/count/${channelUserId}`);
    const updatedCount= res.data.subscribersCount;
    if(onSubscriptionChange){
      onSubscriptionChange(updatedCount); // state  of count uplift to parent videodetails
    }
    } catch (error) {
      console.error(`Error in ${action}:`, error);
    }
  };

  return (
    <button
      onClick={handleSubscription}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`px-4 py-2 font-semibold rounded-md transition-all duration-300
        ${
          subscribed
            ? hover
              ? "bg-red-600 text-black" // Show "Unsubscribe" effect on hover
              : "bg-gray-300 text-black flex items-center gap-2"
            : "bg-red-600 text-black"
        }
      `}
    >
      {subscribed ? (hover ? "Unsubscribe" : <><FaBell /> Subscribed</>) : "Subscribe"}
    </button>
  );
};

export default SubscribeButton;
