import { NextRequest, NextResponse } from "next/server";
import { getTrendingVideos, getVideoStats } from "@/config/youtube.axios";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const allVideos = await getTrendingVideos();
    // console.log('Raw videos data:', JSON.stringify(allVideos, null, 2));

    if (!Array.isArray(allVideos)) {
      throw new Error("Invalid response format: videos data is not an array");
    }

    // Track processed video IDs to avoid duplicates
    const processedIds = new Set<string>();

    const processedVideos = await Promise.all(
      allVideos.map(async (video) => {
        try {
          if (!video?.snippet?.resourceId?.videoId) {
            console.error("Invalid video data:", video);
            return null;
          }

          const videoId = video.snippet.resourceId.videoId;

          // Skip duplicate video IDs
          if (processedIds.has(videoId)) {
            // console.log(`Skipping duplicate video ID: ${videoId}`);
            return null;
          }

          // Add to processed IDs set
          processedIds.add(videoId);

          const videoStats = await getVideoStats(videoId);

          return {
            id: videoId,
            channelTitle: video.snippet.channelTitle,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails,
            publishedAt: video.snippet.publishedAt,
            likes: videoStats?.likeCount || "0",
            comments: videoStats?.commentCount || "0",
            views: videoStats?.viewCount || "0",
          };
        } catch (err) {
          console.error(
            `Error processing video: ${video?.snippet?.resourceId?.videoId}`,
            err
          );
          return null;
        }
      })
    );

    // Filter out any null values from failed processing
    const validVideos = processedVideos.filter(
      (video): video is NonNullable<typeof video> => video !== null
    );

    // console.log('Processed videos:', JSON.stringify(validVideos, null, 2));

    // Create response with cache headers
    const response = NextResponse.json({
      success: true,
      message: "Videos fetched successfully",
      videos: validVideos,
    });

    // Add cache control headers
    response.headers.set("Cache-Control", "public, max-age=300"); // 5 minutes

    return response;
  } catch (error) {
    console.error("Error in YouTube playlist route:", error);

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
        error: "Failed to fetch videos",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
