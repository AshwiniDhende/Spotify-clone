import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Body from "./Body";
import Footer from "./Footer";
import { useStateProvider } from "../utils/StateProvider";
import { reducerCases } from "../utils/Constants";

export default function Spotify() {
  const [{ token }, dispatch] = useStateProvider(); // Destructure token from state
  const bodyRef = useRef();
  const [navbackground, setNavbackground] = useState(false);
  const [headerbackground, setheaderbackground] = useState(false);
  
  const bodyScrolled = () => {
    bodyRef.current.scrollTop >= 30
      ? setNavbackground(true)
      : setNavbackground(false);

    bodyRef.current.scrollTop >= 68
      ? setheaderbackground(true)
      : setheaderbackground(false);
  };

  useEffect(() => {
    const getUserInfo = async () => {
      // Check if token is available
      if (!token) {
        console.error("No token found");
        return; // Exit early if no token is available
      }

      try {
        const { data } = await axios.get("https://api.spotify.com/v1/me", {
          headers: {
            'Authorization': `Bearer ${token}`, // Use the actual token here
          },
        });
        const userInfo = {
          userId: data.id,
          userName: data.display_name,
        };
        dispatch({ type: reducerCases.SET_USER, userInfo });
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    getUserInfo();
  }, [dispatch, token]); // Re-run effect when token changes

  return (
    <Container>
      <div className="spotify_body">
        <Sidebar />
        <div className="body" ref={bodyRef} onScroll={bodyScrolled}>
          <Navbar navbackground={navbackground} />
          <div className="body_contents">
            <Body headerbackground={headerbackground} />
          </div>
        </div>
      </div>
      <div className="spotify_footer">
        <Footer />
      </div>
    </Container>
  );
}

const Container = styled.div`
  max-width: 100vw;
  max-height: 100vw;
  overflow: hidden;
  display: grid;
  grid-template-rows: 85vh 15vh;
  .spotify_body {
    display: grid;
    grid-template-columns: 15vw 85vw;
    height: 100%;
    width: 100%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 1));
  }
  background-color: rgb(32, 87, 100);
  .body {
    height: 100%;
    width: 100%;
    overflow: scroll;
    &::-webkit-scrollbar {
      width: 0.7rem;
      max-height:2rem;
      &-thumb {
        background-color: rgba(255, 255, 255, 0.6);
      }
    }
  }
`;
