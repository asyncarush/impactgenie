import { NextRequest, NextResponse } from "next/server";
import { getChannelData } from "@/config/youtube.axios";

export async function GET(request: NextRequest) {
  try {
    const channelData = await getChannelData();
    console.log("Channel data fetched successfully:", channelData);
    
    return NextResponse.json({ 
      success: true, 
      message: "YouTube channel data retrieved successfully", 
      channelData 
    });
  } catch (error) {
    console.error("Error in YouTube channel route:", error);
    
    // Check if the error is related to OAuth scopes
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage.includes("scope") || errorMessage.includes("permission")) {
      return NextResponse.json({ 
        error: "YouTube API access denied", 
        message: "Your Google account needs additional permissions for YouTube access" 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: "Failed to fetch YouTube data", 
      message: errorMessage 
    }, { status: 500 });
  }
}
