import { NextRequest, NextResponse } from "next/server";
import { getVideoStats } from "@/config/youtube.axios";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const videoId = params.get("Id");

  try {
    const videoStats = await getVideoStats(videoId);
    // console.log("All videos fetched successfully:", allVideos);

    //

    return NextResponse.json({
      success: true,
      message: "All videos fetched successfully",
      videoStats,
    });
  } catch (error) {
    console.error("Error in YouTube channel route:", error);

    // Check if the error is related to OAuth scopes
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("scope") || errorMessage.includes("permission")) {
      return NextResponse.json(
        {
          error: "YouTube API access denied",
          message:
            "Your Google account needs additional permissions for YouTube access",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch Videos",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
