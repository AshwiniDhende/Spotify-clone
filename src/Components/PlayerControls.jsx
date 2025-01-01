import React from "react";
import styled from "styled-components";
import {
  BsFillPlayCircleFill,
  BsFillPauseCircleFill,
  BsShuffle,
  BsRepeat, // Import the missing BsRepeat
} from "react-icons/bs";
import { CgPlayTrackNext, CgPlayTrackPrev } from "react-icons/cg";
import { useStateProvider } from "../utils/StateProvider";
import axios from "axios";
import { reducerCases } from "../utils/Constants";
import { jwtDecode } from 'jwt-decode';


// Check if the token is expired
const isTokenExpired = (token) => {
  if (!token) return true; // Token is invalid if it's null/undefined
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // If decoding fails, consider the token expired
  }
};

// Check if there is an active device for playback
const checkActiveDevice = async (token) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data && response.data.device) {
      return true; // There's an active device
    }
  } catch (error) {
    console.error("Error checking active device:", error);
  }
  return false; // No active device
};

export default function PlayerControls() {
  const [{ token, playerState }, dispatch] = useStateProvider();

  // Function to change the play/pause state
  const changeState = async () => {
    if (!token || isTokenExpired(token)) {
      console.error("Invalid or expired token");
      return;
    }

    const hasActiveDevice = await checkActiveDevice(token);
    if (!hasActiveDevice) {
      console.error("No active device found");
      alert("No active device found. Please connect a device.");
      return;
    }

    try {
      const currentState = playerState ? "pause" : "play"; // Toggle play/pause
      await axios.put(
        `https://api.spotify.com/v1/me/player/${currentState}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Sync the current player state
      const { data } = await axios.get("https://api.spotify.com/v1/me/player", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch({
        type: reducerCases.SET_PLAYER_STATE,
        playerState: data.is_playing,
      });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error(
          "403 Forbidden: Token is invalid or missing necessary scopes"
        );
        alert("You don't have permission to control playback.");
      } else {
        console.error("Error changing player state:", error);
      }
    }
  };

  // Function to change track (next/previous)
  const changeTrack = async (type) => {
    if (!token || isTokenExpired(token)) {
      console.error("Invalid or expired token");
      return;
    }

    const hasActiveDevice = await checkActiveDevice(token);
    if (!hasActiveDevice) {
      console.error("No active device found");
      alert("No active device found. Please connect a device.");
      return;
    }

    try {
      await axios.post(
        `https://api.spotify.com/v1/me/player/${type}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.item) {
        const { item } = response.data;
        const currentPlaying = {
          id: item.id,
          name: item.name,
          artists: item.artists.map((artist) => artist.name),
          image: item.album.images[2]?.url || "",
        };
        dispatch({ type: reducerCases.SET_PLAYING, currentPlaying });
      } else {
        dispatch({ type: reducerCases.SET_PLAYING, currentPlaying: null });
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error(
          "403 Forbidden: Token is invalid or missing necessary scopes"
        );
        alert("You don't have permission to change tracks.");
      } else {
        console.error("Error changing track:", error);
      }
    }
  };

  return (
    <Container>
      <div className="shuffle">
        <BsShuffle />
      </div>
      <div className="previous">
        <CgPlayTrackPrev onClick={() => changeTrack("previous")} />
      </div>
      <div className="state">
        {playerState ? (
          <BsFillPauseCircleFill onClick={changeState} />
        ) : (
          <BsFillPlayCircleFill onClick={changeState} />
        )}
      </div>
      <div className="next">
        <CgPlayTrackNext onClick={() => changeTrack("next")} />
      </div>
      <div className="repeat">
        <BsRepeat />
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;

  svg {
    color: #b3b3b3;
    transition: 0.2s ease-in-out;

    &:hover {
      color: white;
    }
  }

  .state {
    svg {
      color: white;
    }
  }

  .previous,
  .next,
  .state {
    font-size: 2rem;
  }
`;
