import { BrowserRouter, Routes, Route } from "react-router-dom";

import SpotifyTest from "./pages/SpotifyTest";
import Home from "./pages/Home";
import LikedSongs from "./pages/LikedSongs";
import TopArtists from "./pages/TopArtists";
import TopSongs from "./pages/TopSongs";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import Inbox from "./pages/Inbox";
import Forums from "./pages/Forums";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spotify-test" element={<SpotifyTest />} />
        <Route path="/liked-songs" element={<LikedSongs />} />
        <Route path="/top-artists" element={<TopArtists />} />
        <Route path="/top-songs" element={<TopSongs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/forums" element={<Forums />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App