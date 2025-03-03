/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import SpotlightCard from "@/components/SpotlightCards";
import SplitText from "@/components/SplitText";
import { useTheme } from "next-themes";

interface ChannelData {
  snippet: {
    title: string;
    description?: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    customUrl?: string;
  };
  statistics?: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
}

interface MetricCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  spotlightColor: string;
  valueColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  icon,
  spotlightColor,
  valueColor,
}) => (
  <SpotlightCard
    className="p-6 rounded-2xl shadow-md card-custom transition-colors"
    spotlightColor={spotlightColor}
  >
    <div className="flex flex-col items-center text-center">
      <div className="icon-container mb-4">{icon}</div>
      <p className={`metric-value ${valueColor}`}>
        {parseInt(value).toLocaleString()}
      </p>
      <p className="metric-label">{label}</p>
    </div>
  </SpotlightCard>
);

export default function YouTubeIntegrationPage() {
  const { isSignedIn } = useUser();
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
    if (isSignedIn) {
      fetchYouTubeChannel();
    }
  }, [isSignedIn, fetchYouTubeChannel]);

  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  // Define spotlight colors based on theme
  const getSpotlightColor = (color: string) => {
    if (theme === "dark") {
      switch (color) {
        case "red":
          return "rgba(248, 113, 113, 0.15)";
        case "purple":
          return "rgba(167, 139, 250, 0.15)";
        case "teal":
          return "rgba(45, 212, 191, 0.15)";
        case "amber":
          return "rgba(251, 191, 36, 0.15)";
        default:
          return "rgba(255, 255, 255, 0.05)";
      }
    } else {
      switch (color) {
        case "red":
          return "rgba(239, 68, 68, 0.1)";
        case "purple":
          return "rgba(139, 92, 246, 0.1)";
        case "teal":
          return "rgba(20, 184, 166, 0.1)";
        case "amber":
          return "rgba(245, 158, 11, 0.1)";
        default:
          return "rgba(0, 0, 0, 0.05)";
      }
    }
  };

  // Icons for metric cards
  const icons = {
    subscribers: (
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="icon-container-subscribers"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    videos: (
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="icon-container-videos"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
    views: (
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="icon-container-views"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    youtube: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-custom transition-colors duration-300 font-poppins">
      <div className="container mx-auto px-4 py-8">
        {/* Header with title and theme toggle */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center">
            <div className="icon-container icon-container-youtube mr-4 rounded-2xl">
              {icons.youtube}
            </div>
            <SplitText
              text={`YouTube Dashboard`}
              className="text-3xl font-bold text-gray-800 dark:text-white font-poppins"
              delay={100}
              animationFrom={{ opacity: 0, transform: "translate3d(0,30px,0)" }}
              animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
              easing="easeOutCubic"
              threshold={0.2}
              rootMargin="-20px"
              onLetterAnimationComplete={() =>
                console.log("All letters have animated!")
              }
            />
          </div>

          <div className="theme-toggle" onClick={toggleTheme}>
            <div className="theme-toggle-thumb"></div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-red-500 dark:border-gray-400 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-gray-900/30 border-l-4 border-red-500 dark:border-gray-500 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-gray-300 font-poppins">
              {error}
            </p>
          </div>
        )}

        {/* Channel data display */}
        {channel && (
          <>
            {/* Main channel info with side-by-side layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              {/* Left side - Profile and channel name */}
              <SpotlightCard
                className="lg:col-span-1 p-8 rounded-2xl shadow-md card-custom transition-colors channel-card"
                spotlightColor={getSpotlightColor("red")}
              >
                <div className="flex flex-col items-center">
                  {channel.snippet.thumbnails?.medium?.url && (
                    <div className="relative mb-6">
                      <Image
                        src={channel.snippet.thumbnails.medium.url}
                        alt="Youtube Profile"
                        width={120}
                        height={120}
                        className="rounded-full border-2 border-white dark:border-gray-800 shadow-md profile-image"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 font-poppins">
                      {channel.snippet.title}
                    </h2>
                    {channel.snippet.customUrl && (
                      <a
                        href={`https://youtube.com/${channel.snippet.customUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-red-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-white text-sm font-poppins"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        @{channel.snippet.customUrl}
                      </a>
                    )}
                  </div>
                </div>
              </SpotlightCard>

              {/* Right side - Statistics cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {channel.statistics && (
                  <>
                    <MetricCard
                      value={channel.statistics.subscriberCount}
                      label="Subscribers"
                      icon={icons.subscribers}
                      spotlightColor={getSpotlightColor("purple")}
                      valueColor="text-purple-600 dark:text-gray-200"
                    />

                    <MetricCard
                      value={channel.statistics.videoCount}
                      label="Videos"
                      icon={icons.videos}
                      spotlightColor={getSpotlightColor("teal")}
                      valueColor="text-teal-600 dark:text-gray-200"
                    />

                    <MetricCard
                      value={channel.statistics.viewCount}
                      label="Total Views"
                      icon={icons.views}
                      spotlightColor={getSpotlightColor("amber")}
                      valueColor="text-amber-600 dark:text-gray-200"
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
