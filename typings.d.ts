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
    likeCount?: string;
    commentCount?: string;
    shareCount?: string;
    last10ViewsCount?: string;
  };
  historicalData?: {
    "7d": {
      subscriberCount: string;
      viewCount: string;
      videoCount: string;
    };
    "1m": {
      subscriberCount: string;
      viewCount: string;
      videoCount: string;
    };
    "3m": {
      subscriberCount: string;
      viewCount: string;
      videoCount: string;
    };
  };
}
