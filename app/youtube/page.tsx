/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import SpotlightCard from "@/components/SpotlightCards";
import Image from "next/image";
import SplitText from "@/components/SplitText";

export default function YouTubeIntegrationPage() {
  const { isSignedIn, user } = useUser();
  const [channel, setChannel] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [needsYouTubeScope, setNeedsYouTubeScope] = useState(false);

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

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
    };

    checkGoogleConnection();
    fetchYouTubeChannel();
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
      console.log("data", data);
      const snippet = data.channelData.items[0];
      setChannel(snippet);

      console.log("YouTube data:", data);
    } catch (err) {
      console.error("Error fetching YouTube data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(channel);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h1 className="text-3xl font-bold mb-8">YouTube Integration</h1> */}
      {isLoading === false && (
        <SplitText
          text="Welcome, Arush!"
          className="text-5xl font-semibold text-center font-poppins"
          delay={150}
          animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
          animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
          easing="easeOutCubic"
          threshold={0.2}
          rootMargin="-50px"
          onLetterAnimationComplete={handleAnimationComplete}
        />
      )}

      {isLoading && (
        <div className="text-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      )}

      {channel && (
        <div className="flex gap-2">
          <div className="shadow-md rounded-lg p-6">
            <SpotlightCard
              className="flex flex-col p-4 justify-center items-center"
              spotlightColor="rgba(128, 0, 128, 0.2)"
            >
              <Image
                src={channel.snippet.thumbnails.medium.url}
                alt="Youtube Profile Picture"
                width={"150"}
                height={"150"}
                className="rounded-full"
              />
              {/* channel name */}

              <p className="text-3xl font-semibold mt-5">
                {channel.snippet.title}
              </p>
            </SpotlightCard>
          </div>
        </div>
      )}

      {!channel && !error && !isLoading && (
        <div className="text-center p-8">
          <p className="mb-4">Connect your YouTube channel to get started</p>
        </div>
      )}

      {/* <div className="mt-8">
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Back to Dashboard
        </Link>
      </div> */}
    </div>
  );
}