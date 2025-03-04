import axios, { AxiosError } from "axios";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { access } from "fs";

const API_YOUTUBE = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
  withCredentials: true,
});

async function getOAuth2Token() {
  const { userId } = await auth();
  // Get the client and fetch the OAuth token
  const client = await clerkClient();

  const response = await client.users.getUserOauthAccessToken(
    userId as string,
    "google"
  );

  if (!userId) throw new Error("User not authenticated");

  if (!response.data || response.data.length === 0) {
    throw new Error("No OAuth access token found for the user");
  }

  const accessToken = response.data[0].token;

  return { userId, client, response, accessToken };
}

// interceptor for in injecting the access token
API_YOUTUBE.interceptors.request.use(
  async (config) => {
    const { accessToken } = await getOAuth2Token();

    console.log(accessToken);
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

async function getChannelData() {
  const { accessToken } = await getOAuth2Token();

  try {
    // Make the API call to YouTube
    const channelResponse = await API_YOUTUBE.get(
      "/channels?part=snippet,statistics&mine=true"
    );

    return channelResponse.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error("YouTube API Error:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.error?.message || "Unable to get channel data"
    );
  }
}

// fetch last 10 videos with likes and comments count with views
async function getTrendingVideos() {
  const response = await getOAuth2Token();

  try {
    const getPlaylistData = await API_YOUTUBE.get(
      "/channels?part=contentDetails&mine=true"
    );

    const playlistId = await getPlaylistData.data.items[0].contentDetails
      .relatedPlaylists.uploads;

    const response = await API_YOUTUBE.get(
      `/playlistItems?part=snippet&maxResults=10&playlistId=${playlistId}`
    );
    const top10Videos = response.data.items;
    return top10Videos;
  } catch (error) {
    const err = error as AxiosError;
    console.error("YouTube API Error:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.error?.message || "Unable to get channel data"
    );
  }
}

async function getVideoStats(videoId: string | null) {
  try {
    const getVideoData = await API_YOUTUBE.get(
      `/videos?part=statistics&id=${videoId}`
    );
    const videoData = await getVideoData.data.items[0].statistics;

    return videoData;
  } catch (error) {
    const err = error as AxiosError;
    console.error("YouTube API Error:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.error?.message || "Unable to get Stats of  Video"
    );
  }
}

export { getChannelData, getTrendingVideos, getVideoStats };
