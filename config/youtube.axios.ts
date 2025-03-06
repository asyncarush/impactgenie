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
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('User authentication required');
    }

    // Get the client and fetch the OAuth token
    const client = await clerkClient();
    if (!client) {
      throw new Error('Failed to initialize authentication client');
    }

    const response = await client.users.getUserOauthAccessToken(
      userId,
      'google'
    ).catch(error => {
      console.error('OAuth token fetch error:', error);
      throw new Error('Failed to get YouTube access token. Please reconnect your Google account.');
    });

    if (!response?.data || response.data.length === 0) {
      throw new Error('No YouTube access found. Please connect your Google account with YouTube permissions.');
    }

    const accessToken = response.data[0].token;
    if (!accessToken) {
      throw new Error('Invalid YouTube access token. Please reconnect your Google account.');
    }

    return { userId, client, response, accessToken };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to authenticate with YouTube. Please try signing in again.'
    );
  }
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

interface UploadProgressCallback {
  (progress: number): void;
}

async function uploadVideo(videoData: {
  title: string;
  description: string;
  privacy: string;
  tags?: string[];
  category?: string;
  videoFile: File;
  thumbnail?: File;
}, onProgress?: UploadProgressCallback) {
  try {
    // Verify authentication first
    const { accessToken, userId } = await getOAuth2Token();
    if (!accessToken) {
      throw new Error('No access token available. Please authenticate with YouTube.');
    }

    // Constants for upload configuration
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks as recommended by YouTube
    const MAX_RETRIES = 5;
    const INITIAL_RETRY_DELAY = 1000; // Start with 1 second delay

    // First, initiate the video upload with metadata
    const videoMetadata = {
      snippet: {
        title: videoData.title,
        description: videoData.description,
        tags: videoData.tags,
        categoryId: videoData.category || '24', // Default to 'Entertainment' if not specified
      },
      status: {
        privacyStatus: videoData.privacy,
        selfDeclaredMadeForKids: false,
      },
    };

    // Initialize the resumable upload session
    const initResponse = await API_YOUTUBE.post(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails',
      videoMetadata,
      {
        headers: {
          'X-Upload-Content-Type': videoData.videoFile.type,
          'X-Upload-Content-Length': videoData.videoFile.size.toString(),
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );

    const uploadUrl = initResponse.headers['location'];
    if (!uploadUrl) {
      throw new Error('Failed to get upload URL from YouTube');
    }

    // Upload the video in chunks with improved error handling
    const fileSize = videoData.videoFile.size;
    let uploaded = 0;
    let lastSuccessfulByte = 0;

    while (uploaded < fileSize) {
      let retryCount = 0;
      let chunkUploaded = false;

      while (!chunkUploaded && retryCount < MAX_RETRIES) {
        try {
          // Before uploading a chunk, verify the last successful byte
          if (retryCount > 0) {
            const statusResponse = await API_YOUTUBE.put(uploadUrl, null, {
              headers: { 'Content-Range': `bytes */${fileSize}` },
            });

            // If we get a 308 Resume Incomplete status, extract the last successful byte
            if (statusResponse.status === 308 && statusResponse.headers['range']) {
              const range = statusResponse.headers['range'];
              lastSuccessfulByte = parseInt(range.split('-')[1]) + 1;
              uploaded = lastSuccessfulByte;
            }
          }

          const chunk = await videoData.videoFile.slice(uploaded, Math.min(uploaded + CHUNK_SIZE, fileSize)).arrayBuffer();
          const end = Math.min(uploaded + chunk.byteLength, fileSize);

          const response = await API_YOUTUBE.put(uploadUrl, chunk, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Range': `bytes ${uploaded}-${end - 1}/${fileSize}`,
            },
            // Increase timeout for larger chunks
            timeout: 60000, // 60 second timeout
          });

          // Check if this is the final chunk and we got the video ID
          if (response.status === 200 || response.status === 201) {
            return {
              success: true,
              videoId: response.data.id,
              message: 'Video uploaded successfully',
              url: `https://youtube.com/watch?v=${response.data.id}`,
            };
          }

          uploaded = end;
          chunkUploaded = true;

          // Update progress
          const progress = Math.round((uploaded / fileSize) * 100);
          if (onProgress) {
            onProgress(progress);
          }

        } catch (error) {
          const err = error as AxiosError;
          console.error(`Chunk upload error (attempt ${retryCount + 1}):`, err.message);

          // Handle specific error cases
          if (err.response?.status === 401) {
            throw new Error('YouTube authentication expired. Please sign in again.');
          } else if (err.response?.status === 403) {
            throw new Error('Access to YouTube API denied. Please check your permissions.');
          } else if (err.response?.status === 503) {
            throw new Error('YouTube service is currently unavailable. Please try again later.');
          }

          retryCount++;
          if (retryCount >= MAX_RETRIES) {
            throw new Error(`Failed to upload video chunk after ${MAX_RETRIES} attempts`);
          }

          // Exponential backoff with jitter
          const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount) + Math.random() * 1000, 64000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error('Upload completed but failed to get video ID');

  } catch (error) {
    const err = error as AxiosError<YouTubeApiErrorResponse>;
    console.error('YouTube API Error:', err.response?.data || err.message);
    
    // Enhanced error handling
    if (err.response?.status === 401) {
      throw new Error('YouTube authentication expired. Please sign in again.');
    } else if (err.response?.status === 403) {
      throw new Error('Access to YouTube API denied. Please check your permissions.');
    } else if (err.message.includes('timeout')) {
      throw new Error('Upload timed out. Please check your internet connection and try again.');
    } else if (err.message.includes('quota')) {
      throw new Error('YouTube API quota exceeded. Please try again later.');
    } else if (err.message.includes('network')) {
      throw new Error('Network error occurred. Please check your internet connection.');
    }
    
    throw new Error(
      err.response?.data?.error?.message || 'Failed to upload video'
    );
  } finally {
    // Clean up progress tracking
    if (typeof onProgress === 'function') {
      onProgress(0);
    }
  }
}

export { 
  getChannelData, 
  getTrendingVideos, 
  getVideoStats, 
  getCachedHistoricalData,
  uploadVideo 
};
