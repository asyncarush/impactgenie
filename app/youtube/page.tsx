"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function YouTubeIntegrationPage() {
  const { isSignedIn, user } = useUser();
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsYouTubeScope, setNeedsYouTubeScope] = useState(false);

  useEffect(() => {
    const checkGoogleConnection = async () => {
      if (!isSignedIn || !user) return;

      // Check if the user has connected their Google account
      const googleAccount = user.externalAccounts?.find(
        (account) => account.provider === "google"
      );

      if (!googleAccount) {
        setError("Please connect your Google account to access YouTube data");
        return;
      }

      // If Google account is connected, try fetching YouTube data
      fetchYouTubeChannel();
    };

    checkGoogleConnection();
  }, [isSignedIn, user]);

  const fetchYouTubeChannel = async () => {
    if (!isSignedIn) return;
    console.log("Fetching YouTube data...");

    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch channel data using the Clerk's Google OAuth token
      const response = await fetch("/api/youtube/channel");
      const data = await response.json();

      console.log("YouTube data:", data);
    } catch (err) {
      console.error("Error fetching YouTube data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">YouTube Integration</h1>

      {isLoading && (
        <div className="text-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>

          {needsYouTubeScope && (
            <div className="mt-4">
              <p className="mb-2">
                To access YouTube data, you need to grant additional
                permissions:
              </p>
              <ol className="list-decimal pl-5 mb-4">
                <li>Go to your account settings</li>
                <li>Disconnect your Google account</li>
                <li>
                  Reconnect it and ensure you grant permission to access YouTube
                </li>
              </ol>
              <Link
                href="/user-profile"
                className="text-blue-500 hover:underline"
              >
                Go to your profile
              </Link>
            </div>
          )}
        </div>
      )}

      {channel && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col items-center">
            {channel.snippet.thumbnails?.medium?.url && (
              <img
                src={channel.snippet.thumbnails.medium.url}
                alt={channel.snippet.title}
                className="w-24 h-24 rounded-full mb-4"
              />
            )}
            <h2 className="text-xl font-bold">{channel.snippet.title}</h2>
            {channel.snippet.customUrl && (
              <a
                href={`https://youtube.com/${channel.snippet.customUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {channel.snippet.customUrl}
              </a>
            )}
            <p className="text-gray-600 text-center mt-2">
              {channel.snippet.description}
            </p>

            {channel.statistics && (
              <div className="grid grid-cols-3 gap-4 mt-6 w-full">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold">
                    {parseInt(
                      channel.statistics.subscriberCount
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Subscribers</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold">
                    {parseInt(channel.statistics.videoCount).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Videos</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold">
                    {parseInt(channel.statistics.viewCount).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Views</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!channel && !error && !isLoading && (
        <div className="text-center p-8">
          <p className="mb-4">Connect your YouTube channel to get started</p>
          <button
            onClick={fetchYouTubeChannel}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Load YouTube Data
          </button>
        </div>
      )}

      <div className="mt-8">
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
