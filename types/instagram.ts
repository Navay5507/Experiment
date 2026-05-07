export interface InstagramAccount {
  id: string;
  userId: string;
  instagramId: string;
  username: string;
  tokenExpiresAt: string | null;
  connectedAt: string;
}

export interface InstagramPost {
  id: string;
  caption: string | null;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  timestamp: string;
  thumbnail_url?: string;
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
}

export interface WebhookCommentEvent {
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      value: {
        from: {
          id: string;
          username: string;
        };
        media: {
          id: string;
          media_product_type: string;
        };
        id: string;
        text: string;
      };
      field: string;
    }>;
  }>;
  object: string;
}

export interface WebhookMessageEvent {
  entry: Array<{
    id: string;
    time: number;
    messaging: Array<{
      sender: {
        id: string;
      };
      recipient: {
        id: string;
      };
      timestamp: number;
      message: {
        mid: string;
        text: string;
      };
    }>;
  }>;
  object: string;
}
