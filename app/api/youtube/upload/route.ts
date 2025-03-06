import { NextResponse } from "next/server";
import { uploadVideo } from "@/config/youtube.axios";

// Store upload progress for each user
const uploadProgress = new Map<string, number>();

export async function GET(req: Request) {
  try {
    // Extract user ID from the query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required to check upload progress",
          code: "MISSING_USER_ID",
        },
        { status: 400 }
      );
    }

    const progress = uploadProgress.get(userId) || 0;
    return NextResponse.json({
      progress,
      success: true,
    });
  } catch (error) {
    console.error("Error getting upload progress:", error);

    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      return NextResponse.json(
        {
          error:
            "Unable to connect to the server. Please check your internet connection.",
          code: "NETWORK_ERROR",
          success: false,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to retrieve upload progress. Please try again.",
        code: "PROGRESS_FETCH_ERROR",
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const privacy = formData.get("privacy") as string;
    const tags = formData.get("tags") as string;
    const category = formData.get("category") as string;
    const videoFile = formData.get("videoFile") as File;
    const thumbnail = formData.get("thumbnail") as File;
    const userId = formData.get("userId") as string;

    // Validate required fields
    const missingFields = [];
    if (!videoFile) missingFields.push("video file");
    if (!title) missingFields.push("title");
    if (!userId) missingFields.push("user ID");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
          code: "MISSING_REQUIRED_FIELDS",
          fields: missingFields,
        },
        { status: 400 }
      );
    }

    // Initialize progress for this user
    uploadProgress.set(userId, 0);

    try {
      const result = await uploadVideo(
        {
          title,
          description,
          privacy,
          tags: tags ? tags.split(",").map((tag) => tag.trim()) : undefined,
          category,
          videoFile,
          thumbnail,
        },
        (progress) => {
          uploadProgress.set(userId, progress);
        }
      );

      // Clear progress after successful upload
      uploadProgress.delete(userId);

      return NextResponse.json({
        ...result,
        progress: 100,
      });
    } catch (uploadError) {
      // Clean up progress tracking
      uploadProgress.delete(userId);

      // Handle specific YouTube API errors
      if (uploadError instanceof Error) {
        if (
          uploadError.message.includes("authentication") ||
          uploadError.message.includes("sign in")
        ) {
          return NextResponse.json(
            {
              error: uploadError.message,
              code: "AUTH_ERROR",
              success: false,
            },
            { status: 401 }
          );
        }

        if (uploadError.message.includes("quota")) {
          return NextResponse.json(
            {
              error: uploadError.message,
              code: "QUOTA_EXCEEDED",
              success: false,
            },
            { status: 429 }
          );
        }

        if (
          uploadError.message.includes("timeout") ||
          uploadError.message.includes("network")
        ) {
          return NextResponse.json(
            {
              error: uploadError.message,
              code: "NETWORK_ERROR",
              success: false,
            },
            { status: 503 }
          );
        }
      }

      // Generic error response
      return NextResponse.json(
        {
          error:
            uploadError instanceof Error
              ? uploadError.message
              : "An unexpected error occurred during video upload",
          code: "UPLOAD_FAILED",
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // Handle request parsing errors
    console.error("Error processing upload request:", error);
    return NextResponse.json(
      {
        error: "Failed to process upload request",
        code: "REQUEST_FAILED",
        success: false,
      },
      { status: 400 }
    );
  }
}
