import axios, { AxiosError } from "axios";
import { auth, clerkClient } from "@clerk/nextjs/server";

const API_YOUTUBE = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
  withCredentials: true,
});

async function getChannelData() {
  try {
    // Get the user ID from auth
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Get the client and fetch the OAuth token
    const client = await clerkClient();
    const response = await client.users.getUserOauthAccessToken(
      userId as string,
      "oauth_google"
    );
    
    if (!response.data || response.data.length === 0) {
      throw new Error("No OAuth access token found for the user");
    }
    
    const accessToken = response.data[0].token;
    
    // Make the API call to YouTube
    const channelResponse = await API_YOUTUBE.get(
      "/channels?part=snippet,statistics&mine=true",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    return channelResponse.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error("YouTube API Error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error?.message || "Unable to get channel data");
  }
}

export { getChannelData };
