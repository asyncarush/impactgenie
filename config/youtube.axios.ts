import axios, { AxiosError } from "axios";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";

const { userId } = await auth();

const user = await currentUser();

const client = await clerkClient();

const response = await client.users.getUserOauthAccessToken(
  userId as string,
  "google"
);

const accessToken = response.data[0].token;
// const scopes = response.data[0].scopes;

const API_YOUTUBE = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
  withCredentials: true,
});

async function getChannelData() {
  try {
    const channelResponse = await API_YOUTUBE.get(
      "/channels?part=snippet&mine=true",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const channelData = await channelResponse.data;

    return channelData;
  } catch (error) {
    const err = error as AxiosError;
    console.error(err.response);
    return "unable to get channel data";
  }
}

export { getChannelData };
