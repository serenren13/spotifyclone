import { API_URL } from "../../lib/config";

export async function fetchDiscoverData() {
  const usersResponse = await fetch(`${API_URL}/users/discover`);
  const usersData = await usersResponse.json();

  const forumsResponse = await fetch(`${API_URL}/forums`);
  const forumsData = await forumsResponse.json();

  return { usersData, forumsData };
}
