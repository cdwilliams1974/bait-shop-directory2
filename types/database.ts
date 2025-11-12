export type Database = {
  public: {
    Tables: {
      states: {
        Row: {
          id: string;
          name: string;
          slug: string;
          abbr: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['states']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['states']['Insert']>;
      };
      cities: {
        Row: {
          id: string;
          state_id: string;
          name: string;
          slug: string;
          lat: number | null;
          lng: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cities']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['cities']['Insert']>;
      };
      listings: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          phone: string | null;
          website: string | null;
          address: string;
          city_id: string;
          state_id: string;
          postcode: string | null;
          lat: number;
          lng: number;
          bait_types: string[];
          rating: number | null;
          reviews_count: number;
          external_reviews_url: string | null;
          is_verified: boolean;
          static_map_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['listings']['Insert']>;
      };
      listing_hours: {
        Row: {
          id: string;
          listing_id: string;
          weekday: number;
          open_time: string | null;
          close_time: string | null;
          is_24h: boolean;
          is_closed: boolean;
        };
        Insert: Omit<Database['public']['Tables']['listing_hours']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['listing_hours']['Insert']>;
      };
      listing_tags: {
        Row: {
          id: string;
          listing_id: string;
          tag: string;
        };
        Insert: Omit<Database['public']['Tables']['listing_tags']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['listing_tags']['Insert']>;
      };
    };
  };
};
