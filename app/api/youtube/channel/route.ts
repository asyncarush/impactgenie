import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getChannelData } from "@/config/youtube.axios";

export async function GET(request: NextRequest) {
  // const { userId } = await auth();
  // const user = await currentUser();

  // const client = await clerkClient();

  // const response = await client.users.getUserOauthAccessToken(
  //   userId as string,
  //   "google"
  // );

  // const accessToken = response.data[0].token;

  // const scopes = response.data[0].scopes;

  // // also check if scope has above scopes other show erro rthat user needs additional scope for conencting youtube
  // if (!scopes?.includes("https://www.googleapis.com/auth/youtube")) {
  //   return NextResponse.json(
  //     { error: "User needs additional scope for connecting YouTube" },
  //     { status: 401 }
  //   );
  // }

  // fetch channel data
  // const channelResponse = await fetch(
  //   `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   }
  // );

  try {
    const channelData = await getChannelData();
    console.log("All channelData", channelData);

    return NextResponse.json({
      success: true,
      message: "User authenticated",
      channelData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  
}
