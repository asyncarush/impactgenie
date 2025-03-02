import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const user = await currentUser();

  const client = await clerkClient();

  const response = await client.users.getUserOauthAccessToken(
    userId as string,
    "google"
  );

  const accessToken = response.data[0].token;

  const scopes = response.data[0].scopes;

  // also check if scope has above scopes other show erro rthat user needs additional scope for conencting youtube
  if (!scopes?.includes("https://www.googleapis.com/auth/youtube")) {
    return NextResponse.json(
      { error: "User needs additional scope for connecting YouTube" },
      { status: 401 }
    );
  }

  // fetch channel data
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const channelData = await channelResponse.json();
  console.log("All channelData", channelData);

  // console.log("Userid:", userId);
  // console.log("Current User:", user);
  // console.log("resonse Access token:", response);
  // console.log("resonse Scopes", scopes);
  // console.log("resonse access token", accessToken);

  console.log("channel Data", channelData);

  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  // Return a response for authenticated users
  return NextResponse.json(
    { success: true, message: "User authenticated", userId, channelData },
    { status: 200 }
  );
}
