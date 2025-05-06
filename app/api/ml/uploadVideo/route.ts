import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const form = await request.formData();
  const videoFile = form.get("videoFile");
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

  if (!videoFile) {
    return NextResponse.json(
      {
        error: "Video file is required",
        code: "MISSING_VIDEO_FILE",
      },
      { status: 400 }
    );
  }

  
}
