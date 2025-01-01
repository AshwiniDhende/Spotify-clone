const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Spotify App credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.use(cors());

// Step 1: Redirect to Spotify login
app.get('/login', (req, res) => {
  const scope = 'user-library-read user-read-playback-state user-modify-playback-state';
  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
  })}`;
  res.redirect(authUrl);
});

// Step 2: Handle callback from Spotify
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      }
    });

    const { access_token, refresh_token } = response.data;
    // Save access token and refresh token (could be in a session, database, etc.)
    res.json({
      access_token,
      refresh_token,
    });
  } catch (error) {
    res.status(500).send('Error during token exchange.');
  }
});

// Step 3: Refresh Access Token (use refresh token)
app.get('/refresh_token', async (req, res) => {
  const refresh_token = req.query.refresh_token;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      }
    });

    const { access_token } = response.data;
    res.json({ access_token });
  } catch (error) {
    res.status(500).send('Error refreshing token.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
