export interface ChannelData {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    customUrl?: string;
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
    likeCount: string;
    commentCount: string;
    last10ViewsCount: string;
  };
  historicalData?: {
    "7d": HistoricalData;
    "1m": HistoricalData;
    "3m": HistoricalData;
  };
}

export interface HistoricalData {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
}

export interface VideoData {
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
}
