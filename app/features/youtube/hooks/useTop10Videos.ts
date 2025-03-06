import { useState, useEffect } from 'react';
import type { VideoData } from '../types';

interface ApiResponse {
  success: boolean;
  message: string;
  videos: VideoData[];
}

export function useTop10Videos() {
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

  return {
    videos,
    loading,
    error,
  };
}
