import { useEffect, useState } from "react";
import { useSpotify } from "../../context/SpotifyContext";
import { fetchDiscoverData } from "./discoverApi";

export function useDiscover() {
  const { userProfile } = useSpotify();
  const [users, setUsers] = useState([]);
  const [forums, setForums] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("Loading discover page...");

  useEffect(() => {
    async function fetchData() {
      try {
        const { usersData, forumsData } = await fetchDiscoverData();
        setUsers(usersData);
        setForums(forumsData.slice(0, 4));
        setStatus("");
      } catch (error) {
        console.log(error);
        setStatus("Could not load discover page.");
      }
    }

    fetchData();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (userProfile?.id && user.id === userProfile.id) {
      return false;
    }

    const name = user.displayName || user.name || user.username || "";
    const bio = user.bio || "";

    return (
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      bio.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return { forums, searchText, setSearchText, status, filteredUsers };
}
