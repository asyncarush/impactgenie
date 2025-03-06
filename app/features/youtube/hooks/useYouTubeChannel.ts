import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import type { ChannelData } from '../types';

export function useYouTubeChannel() {
  const { isSignedIn } = useUser();
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchYouTubeChannel = useCallback(async () => {
    if (!isSignedIn) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/youtube/channel");
      const data = await response.json();

      if (!response.ok) {
        if (data.error === "YouTube API access denied") {
          setError(data.message || "Additional YouTube permissions required");
        } else {
          setError(data.error || "Failed to fetch YouTube channel data");
        }
        return;
      }

      if (data.success && data.channelData?.items?.length > 0) {
        setChannel(data.channelData.items[0]);
      } else {
        setError("No YouTube channel found for this account");
      }
    } catch (err) {
      console.error("Error fetching YouTube data:", err);
      setError("An error occurred while fetching YouTube data");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  return {
    channel,
    error,
    isLoading,
    fetchYouTubeChannel,
  };
}
