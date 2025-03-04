"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
              <div className="w-5 text-sm text-gray-500">{i + 1}</div>
              <div className="flex-none w-24 aspect-video bg-white/10 rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-white/10 rounded w-3/4" />
                <div className="h-2.5 bg-white/10 rounded w-1/2" />
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
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-sm text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
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
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-colors group"
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
                <h3 className="text-sm font-medium line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
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
