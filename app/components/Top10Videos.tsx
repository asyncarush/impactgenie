"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

interface VideoData {
  id: string;
  channelTitle: string;
  title: string;
  description: string;
  thumbnail: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  likes: string;
  comments: string;
  views: string;
  dislikes: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  videos: VideoData[];
}

export default function Top10Videos() {
  const { theme } = useTheme();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTop10Videos = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/youtube/playlistItems", {
          headers: {
            'Cache-Control': 'max-age=300', // 5 minutes
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiResponse = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        setVideos(data.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch videos");
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTop10Videos();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-3xl">
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex items-center gap-3 ${theme === "dark" ? "bg-black" : "bg-gray-50"} rounded-lg p-2 border border-gray-100 dark:border-gray-800`}>
              <div className="w-5 text-sm text-gray-500">{i + 1}</div>
              <div className="flex-none w-24 aspect-video bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl">
        <div className={`${theme === "dark" ? "bg-red-900/20" : "bg-red-50"} border ${theme === "dark" ? "border-red-800/30" : "border-red-200"} rounded-lg p-2 text-sm ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Top 10 Videos</h2>
      <div className="space-y-2">
        {videos.slice(0, 10).map((video, index) => {
          const thumbnailUrl = video.thumbnail.medium?.url || video.thumbnail.default.url;
          const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
          const formattedViews = parseInt(video.views).toLocaleString();
          const formattedLikes = parseInt(video.likes).toLocaleString();
          const formattedComments = parseInt(video.comments).toLocaleString();

          return (
            <Link
              href={videoUrl}
              key={`video-${video.id}-${index}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 ${theme === "dark" ? "bg-black" : "bg-gray-50"} ${theme === "dark" ? "hover:bg-gray-900" : "hover:bg-gray-100"} rounded-lg p-2 transition-colors group border border-gray-100 dark:border-gray-800`}
            >
              <div className="w-5 text-sm text-gray-500">{index + 1}</div>
              <div className="relative flex-none w-24 aspect-video rounded overflow-hidden">
                <Image
                  src={thumbnailUrl}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority={index < 3}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formattedViews} views</span>
                  <span>•</span>
                  <span>{formattedLikes} likes</span>
                  <span>•</span>
                  <span>{formattedComments} comments</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
