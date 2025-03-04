"use client";

import { getTrendingVideos } from "@/config/youtube.axios";
import React, { useEffect, useState } from "react";

export default function Top10Videos() {
  const [allvideos, setAllVideos] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchTop10Videos = async () => {
      const videos = await fetch("/api/youtube/playlistItems");
      const data = await videos.json();
      setAllVideos(data);
    };
    fetchTop10Videos();

    console.log(allvideos);
  }, [allvideos]);

  return (
    <div>
      <h3>Top trending Videos</h3>
    </div>
  );
}
