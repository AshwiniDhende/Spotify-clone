import React, { useEffect } from "react";
import styled from "styled-components";
import { useStateProvider } from "../utils/StateProvider";
import axios from "axios";
import { reducerCases } from "../utils/Constants";

export default function CurrentTrack() {
  const [{ token, currentlyPlaying }, dispatch] = useStateProvider();

  useEffect(() => {
    const getCurrentTrack = async () => {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.item) {
        const currentlyPlaying = {
          id: response.data.item.id,
          name: response.data.item.name,
          artists: response.data.item.artists.map((artist) => artist.name),
          // Use a safer approach to select the image
          image: response.data.item.album.images[1]?.url || response.data.item.album.images[0]?.url,
        };
        dispatch({ type: reducerCases.SET_PLAYING, currentlyPlaying });
      } else {
        dispatch({ type: reducerCases.SET_PLAYING, currentlyPlaying: null });
      }
    };
    getCurrentTrack();
  }, [token, dispatch]);

  return (
    <Container>
      {currentlyPlaying ? (
        <div className="track">
          <div className="track_image">
            <img src={currentlyPlaying.image} alt={currentlyPlaying.name} />
          </div>
          <div className="track_info">
            <h4>{currentlyPlaying.name}</h4>
            <h6>{currentlyPlaying.artists.join(", ")}</h6>
          </div>
        </div>
      ) : (
        <div className="no_track">
          <p>No track playing currently.</p>
        </div>
      )}
    </Container>
  );
}

const Container = styled.div`
  .track {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .track_image {
    width: 50px;
    height: 50px;
    img {
      width: 100%;
      height: 100%;
      border-radius: 5px;
    }
  }

  .track_info {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    h4 {
      color: white;
    }

    h6 {
      color: #b3b3b3;
    }
  }

  .no_track {
    color: #b3b3b3;
    padding: 1rem;
    text-align: center;
  }
`;
