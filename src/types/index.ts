export type Platform = "instagram" | "youtube" | "tiktok";

export interface UserProfileSummary {
  user_id: string;
  username: string;
  url: string;
  picture: string;
  fullname: string;
  is_verified: boolean;
  followers: number;
  engagements?: number;
  engagement_rate?: number;
  handle?: string;
  avg_views?: number;
}

export interface SearchAccount {
  account: {
    user_profile: UserProfileSummary;
    audience_source: string;
  };
}

export interface SearchData {
  total: number;
  accounts: SearchAccount[];
}

export interface FullUserProfile extends UserProfileSummary {
  type?: string;
  description?: string;
  is_business?: boolean;
  posts_count?: number;
  avg_likes?: number;
  avg_comments?: number;
  avg_reels_plays?: number;
  gender?: string;
  age_group?: string;
  stat_history?: { month: string; followers: number; following?: number; avg_likes?: number }[];
  paid_post_performance?: number;
  brand_affinity?: { id: number; name: string; interest?: { id: number; name: string }[] }[];
  similar_users?: { user_id: string; username: string; picture: string; fullname: string; followers: number; engagement_rate?: number; is_verified?: boolean; url?: string; engagements?: number; score?: number }[];
  top_hashtags?: { tag: string; weight: number }[];
}

export interface ProfileDetailResponse {
  cached?: boolean;
  data: {
    success: boolean;
    user_profile: FullUserProfile;
  };
}
