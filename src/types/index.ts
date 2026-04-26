import { LucideIcon } from "lucide-react";

export interface Link {
  id?: string;
  user_id?: string;
  original_url: string;
  slug: string;
  platform?: string;
  clicks?: number;
  clicks_daily?: Record<string, number>;
  created_at?: string;
  last_accessed_at?: string;
  title?: string;
  type?: string;
  category?: string;
  active?: boolean;
  sort_order?: number;
  deep_link?: boolean;
  is_quick?: boolean;
}

export interface PlatformConfig {
  name: string;
  icon: LucideIcon;
  color: string;
}

export interface ChartDataPoint {
  name: string;
  clicks: number;
}
