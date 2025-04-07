// Video settings interface for customizing the player
export interface VideoSettings {
  playerColor?: string;
  secondaryColor?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  callToAction?: CallToAction;
}

// Call-to-action interface for end of video
export interface CallToAction {
  enabled: boolean;
  title: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  displayTime?: number; // seconds before end to display
}

// Analytics interface for tracking video metrics
export interface VideoAnalytics {
  views: number;
  uniqueViews: number;
  watchTime: {
    total: number; // total seconds watched
    average: number; // average watch time per view
  };
  retention: {
    // percentage of video watched (25%, 50%, 75%, 100%)
    quarters: number[];
  };
  ctaClicks?: number;
  viewsByDate: {
    date: string;
    count: number;
  }[];
}

// Video playback data to track analytics
export interface PlaybackData {
  videoId: string;
  userId?: string;
  sessionId: string;
  startTime: number;
  endTime?: number;
  playbackPositions: {
    position: number; // seconds
    timestamp: number; // epoch time
  }[];
  completedQuarters: number[];
  ctaClicked?: boolean;
} 