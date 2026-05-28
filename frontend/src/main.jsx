import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import { SpotifyProvider } from "./context/SpotifyContext";
import { ThemeProvider } from './context/ThemeContext.jsx'

import Landing from "./pages/Landing.jsx";
import Discover from "./pages/Discover.jsx";
import Forums from "./pages/Forums.jsx";
import Inbox from "./pages/Inbox.jsx";
import LikedSongs from "./pages/LikedSongs.jsx";
import Profile from "./pages/Profile.jsx";
import SpotifyTest from "./pages/SpotifyTest.jsx";
import TopArtists from "./pages/TopArtists.jsx";
import TopSongs from "./pages/TopSongs.jsx";
import PublicProfile from './pages/PublicProfile';
import ArtistProfile from "./pages/ArtistProfile.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SpotifyProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Landing />} />
              <Route path="spotify-test" element={<SpotifyTest />} />
              <Route path="liked-songs" element={<LikedSongs />} />
              <Route path="top-artists" element={<TopArtists />} />
              <Route path="top-songs" element={<TopSongs />} />
              <Route path="profile" element={<Profile />} />
              <Route path="discover" element={<Discover />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="forums" element={<Forums />} />
              <Route path="/user/:id" element={<PublicProfile />} />
              <Route path="/artist/:artistId" element={<ArtistProfile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </SpotifyProvider>
  </StrictMode>
);