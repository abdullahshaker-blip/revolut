export type ContentItem = {
  id: string;
  type: 'article' | 'video' | 'podcast' | 'quote' | 'simulation';
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  isLiked?: boolean;
  content?: string; // For article text
  videoUrl?: string; // For video source
};

// NEW: A structured event for every user interaction.
export type InteractionEvent = {
  timestamp: string;
  itemId: string;
  itemType: ContentItem['type'];
  eventType: 
    | 'view' 
    | 'like'
    | 'quick_exit'
    | 'total_dwell_time'
    | 'scroll_depth'
    | 'scroll_bounce'
    | 'avg_scroll_speed'
    | 'dwell_on_element'
    | 'text_selection'
    | 'video_pause' // Note: This is now less critical but kept for potential use
    | 'video_watch_progress'
    | 'video_rewind'
    | 'video_seek_forward'
    | 'video_rate_change'
    | 'video_volume_change'
    | 'load_error';
  details: {
    durationMs?: number;
    scrollPercent?: number;
    speedPxs?: number; // pixels per second
    elementTag?: string;
    elementId?: string;
    selectedText?: string;
    pauseTimeS?: number;
    watchPercent?: number;
    seekFromS?: number;
    seekToS?: number;
    playbackRate?: number;
    volume?: number;
    muted?: boolean;
    errorSource?: string;
  };
};

export type UserProfile = {
  interactions: {
    liked: string[];
    viewed: string[]; // Kept for simple state, but history is the source of truth
  };
  // UPDATED to store rich, structured events instead of simple strings.
  interactionHistory: InteractionEvent[];
};