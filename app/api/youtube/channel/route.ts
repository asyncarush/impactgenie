import { NextRequest, NextResponse } from "next/server";
import { getChannelData } from "@/config/youtube.axios";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const channelData = await getChannelData();
    console.log("Channel data fetched successfully:", channelData);

    // Create response with cache headers
    const response = NextResponse.json({
      success: true,
      message: "YouTube channel data retrieved successfully",
      channelData,
    });
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    
    return response;
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
        error: "Failed to fetch YouTube data",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

async function getHistoricalData(channelId: string, period: '7d' | '1m' | '3m') {
  const endDate = new Date();
  let startDate = new Date();

  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '1m':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '3m':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
  }

  // Fetch data from YouTube API
  const response = await youtubeAxios.get('/channels', {
    params: {
      id: channelId,
      part: 'statistics',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }
  });

  return response.data.items[0].statistics;
}
