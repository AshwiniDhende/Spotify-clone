import React from "react";
import styled from "styled-components";
import { useStateProvider } from "../utils/StateProvider";
import axios from "axios";

export default function Volume() {
  const [{ token }] = useStateProvider();

  const setVolume = async (e) => {
    // Check if token is available
    if (!token) {
      console.error("No token available.");
      return;
    }

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/volume`,
        null, // Remove the empty object, we don't need it here
        {
          params: {
            volume_percent: parseInt(e.target.value),
          },
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error setting volume:", error);
    }
  };

  return (
    <Container>
      <input
        type="range"
        min={0}
        max={100}
        onChange={(e) => setVolume(e)} // Use onChange for more natural behavior
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  align-content: center;
  input {
    width: 15rem;
    border-radius: 2rem;
    height: 0.5rem;
  }
`;
