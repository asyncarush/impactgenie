import axios, { AxiosError } from "axios";
import { auth, clerkClient } from "@clerk/nextjs/server";

// Define the YouTube API error response structure
interface YouTubeApiErrorResponse {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}
const API_YOUTUBE = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
  withCredentials: true,
});

async function getOAuth2Token() {
  const { userId } = await auth();
  // Get the client and fetch the OAuth token
  const client = await clerkClient();

  const response = await client.users.getUserOauthAccessToken(
    userId as string,
    "google"
  );

  if (!userId) throw new Error("User not authenticated");

  if (!response.data || response.data.length === 0) {
    throw new Error("No OAuth access token found for the user");
  }

  const accessToken = response.data[0].token;

  return { userId, client, response, accessToken };
}

// interceptor for in injecting the access token
API_YOUTUBE.interceptors.request.use(
  async (config) => {
    const { accessToken } = await getOAuth2Token();

    console.log(accessToken);
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

async function getChannelData() {
  const { accessToken } = await getOAuth2Token();

  try {
    // Make the API call to YouTube
    const channelResponse = await API_YOUTUBE.get(
      "/channels?part=snippet,statistics&mine=true"
    );

    // Get videos data to calculate aggregate metrics
    const videos = await getTrendingVideos();
    
    // Calculate aggregate metrics from videos
    let totalLikes = 0;
    let totalComments = 0;
    let totalViewsLast10 = 0;
    
    // Process each video to get statistics
    for (const video of videos) {
      if (video?.snippet?.resourceId?.videoId) {
        try {
          const videoStats = await getVideoStats(video.snippet.resourceId.videoId);
          totalLikes += parseInt(videoStats?.likeCount || '0');
          totalComments += parseInt(videoStats?.commentCount || '0');
          totalViewsLast10 += parseInt(videoStats?.viewCount || '0');
        } catch (err) {
          console.error(`Error getting stats for video ${video.snippet.resourceId.videoId}:`, err);
        }
      }
    }
    
    // Add aggregate metrics to channel data
    const channelData = channelResponse.data;
    if (channelData?.items?.[0]?.statistics) {
      channelData.items[0].statistics.likeCount = totalLikes.toString();
      channelData.items[0].statistics.commentCount = totalComments.toString();
      // Store total views from last 10 videos separately
      channelData.items[0].statistics.last10ViewsCount = totalViewsLast10.toString();
      
      // Get historical data for different time periods
      const channelId = channelData.items[0].id;
      channelData.items[0].historicalData = {
        "7d": await getCachedHistoricalData(channelId, "7d"),
        "1m": await getCachedHistoricalData(channelId, "1m"),
        "3m": await getCachedHistoricalData(channelId, "3m")
      };
    }

    return channelData;
  } catch (error) {
    const err = error as AxiosError<YouTubeApiErrorResponse>;
    console.error("YouTube API Error:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.error?.message || "Unable to get channel data"
    );
  }
}

// Cache for trending videos to prevent duplicate API calls
let cachedVideos: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// fetch last 10 videos with likes and comments count with views
async function getTrendingVideos() {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    if (cachedVideos && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Using cached video data');
      return cachedVideos;
    }

    const { accessToken } = await getOAuth2Token();

    // First get the uploads playlist ID
    const channelResponse = await API_YOUTUBE.get(
      "/channels?part=contentDetails&mine=true"
    );

    if (!channelResponse.data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads) {
      throw new Error("Could not find uploads playlist");
    }

    const playlistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    // Then get the playlist items with full snippet data
    const playlistResponse = await API_YOUTUBE.get(
      `/playlistItems?part=snippet,contentDetails&maxResults=10&playlistId=${playlistId}`
    );

    if (!playlistResponse.data?.items) {
      throw new Error("No videos found in playlist");
    }

    // Cache the results
    cachedVideos = playlistResponse.data.items;
    cacheTimestamp = now;
    
    console.log('Playlist response:', JSON.stringify(playlistResponse.data, null, 2));
    return playlistResponse.data.items;
  } catch (error) {
    const err = error as AxiosError<YouTubeApiErrorResponse>;
    console.error("YouTube API Error:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.error?.message || "Failed to fetch trending videos"
    );
  }
}

// Cache for video statistics to prevent duplicate API calls
const videoStatsCache: Record<string, any> = {};

async function getVideoStats(videoId: string | null) {
  try {
    if (!videoId) {
      throw new Error("Video ID is null or undefined");
    }
    
    // Check if we have cached stats for this video
    if (videoStatsCache[videoId]) {
      console.log(`Using cached stats for video ${videoId}`);
      return videoStatsCache[videoId];
    }
    
    const getVideoData = await API_YOUTUBE.get(
      `/videos?part=statistics&id=${videoId}`
    );
    const videoData = await getVideoData.data.items[0].statistics;
    
    // Cache the results
    videoStatsCache[videoId] = videoData;
    
    return videoData;
  } catch (error) {
    const err = error as AxiosError<YouTubeApiErrorResponse>;
    console.error("YouTube API Error:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.error?.message || "Unable to get Stats of  Video"
    );
  }
}

const historicalDataCache = new Map<string, any>();

const getCachedHistoricalData = async (channelId: string, period: '7d' | '1m' | '3m') => {
  const cacheKey = `${channelId}-${period}`;
  if (historicalDataCache.has(cacheKey)) {
    return historicalDataCache.get(cacheKey);
  }

  const data = await getHistoricalData(channelId, period);
  historicalDataCache.set(cacheKey, data);
  setTimeout(() => historicalDataCache.delete(cacheKey), CACHE_DURATION); // Use the same cache duration constant
  return data;
};

async function getHistoricalData(channelId: string, period: '7d' | '1m' | '3m') {
  try {
    // For demonstration purposes, we'll simulate historical data
    // In a real implementation, you would fetch this from YouTube Analytics API
    // which requires additional scopes and permissions
    
    const currentStats = await API_YOUTUBE.get(
      `/channels?part=statistics&id=${channelId}`
    );
    
    const stats = currentStats.data.items[0].statistics;
    
    // Create more realistic historical data simulation
    // In a real implementation, use YouTube Analytics API with proper date ranges
    const getHistoricalValue = (current: number, periodType: '7d' | '1m' | '3m') => {
      // For more realistic growth patterns:
      // - Subscribers typically grow slowly but steadily
      // - Views grow faster than subscribers
      // - Video count grows the slowest
      
      // Use channel ID to create consistent simulation
      const channelSeed = channelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const dateSeed = new Date().getDate(); // Use current date for some variability between days
      const seed = (channelSeed + dateSeed) % 100;
      
      let growthRate;
      
      // Different metrics have different typical growth rates
      const getMetricGrowthRate = (metricType: 'subs' | 'views' | 'videos', periodType: '7d' | '1m' | '3m') => {
        // Base growth rates (monthly)
        const baseGrowthRates = {
          subs: 0.05, // 5% monthly growth for subscribers
          views: 0.08, // 8% monthly growth for views
          videos: 0.03 // 3% monthly growth for videos
        };
        
        // Adjust for period length
        let periodMultiplier;
        switch(periodType) {
          case '7d':
            periodMultiplier = 0.25; // Approximately 1/4 of a month
            break;
          case '1m':
            periodMultiplier = 1; // One month
            break;
          case '3m':
            periodMultiplier = 3; // Three months
            break;
        }
        
        // Add some variability based on channel
        const variability = (seed / 100) * 0.5; // Up to 50% variability
        
        return baseGrowthRates[metricType] * periodMultiplier * (1 + variability);
      };
      
      // Determine which metric we're calculating
      let metricType: 'subs' | 'views' | 'videos';
      if (current === parseInt(stats.subscriberCount)) {
        metricType = 'subs';
      } else if (current === parseInt(stats.viewCount)) {
        metricType = 'views';
      } else {
        metricType = 'videos';
      }
      
      // Calculate growth rate for this specific metric and period
      growthRate = getMetricGrowthRate(metricType, periodType);
      
      // Calculate historical value (current value / (1 + growth rate))
      return Math.max(Math.floor(current / (1 + growthRate)), 0);
    };
    
    // Get current values
    const currentSubs = parseInt(stats.subscriberCount);
    const currentViews = parseInt(stats.viewCount);
    const currentVideos = parseInt(stats.videoCount);
    
    // Return historical data for the specified period
    return {
      subscriberCount: getHistoricalValue(currentSubs, period).toString(),
      viewCount: getHistoricalValue(currentViews, period).toString(),
      videoCount: getHistoricalValue(currentVideos, period).toString()
    };
  } catch (error) {
    console.error(`Error fetching historical data for period ${period}:`, error);
    // Return default values if there's an error
    return {
      subscriberCount: "0",
      viewCount: "0",
      videoCount: "0"
    };
  }
}

export { getChannelData, getTrendingVideos, getVideoStats, getCachedHistoricalData };
