import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    // Capture tokens from URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get("access_token");
    const refresh = hashParams.get("refresh_token");

    if (token) {
      setAccessToken(token);
      setRefreshToken(refresh);
    }
  }, []);

  const refreshAccessToken = async () => {
    if (!refreshToken) return;

    try {
      const response = await axios.get(`http://localhost:5000/refresh_token?refresh_token=${refreshToken}`);
      setAccessToken(response.data.access_token);
    } catch (error) {
      console.error("Error refreshing access token:", error);
    }
  };

  return (
    <div>
      {!accessToken ? (
        <button onClick={loginToSpotify}>Login with Spotify</button>
      ) : (
        <div>
          <p>Logged in! Access token: {accessToken}</p>
          <button onClick={refreshAccessToken}>Refresh Token</button>
        </div>
      )}
    </div>
  );
};

export default App;
