export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blocked_time_slots: {
        Row: {
          blocked_date: string
          business_id: string
          created_at: string | null
          end_time: string
          id: string
          reason: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          blocked_date: string
          business_id: string
          created_at?: string | null
          end_time: string
          id?: string
          reason?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          blocked_date?: string
          business_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          reason?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_time_slots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          business_id: string
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          duration_minutes: number
          id: string
          notes: string | null
          payment_status: string | null
          service_id: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          business_id: string
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          payment_status?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          business_id?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          payment_status?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          average_rating: number | null
          boroughs: string[] | null
          category: string
          created_at: string | null
          description: string | null
          email: string | null
          featured: boolean | null
          id: string
          image_urls: string[] | null
          latitude: number | null
          longitude: number | null
          moderation_status: string | null
          name: string
          neighborhoods: string[] | null
          owner_id: string
          phone: string | null
          review_count: number | null
          short_description: string | null
          social_media: Json | null
          total_bookings: number | null
          total_orders: number | null
          updated_at: string | null
          verified: boolean | null
          wallet_balance: number | null
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          average_rating?: number | null
          boroughs?: string[] | null
          category: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          moderation_status?: string | null
          name: string
          neighborhoods?: string[] | null
          owner_id: string
          phone?: string | null
          review_count?: number | null
          short_description?: string | null
          social_media?: Json | null
          total_bookings?: number | null
          total_orders?: number | null
          updated_at?: string | null
          verified?: boolean | null
          wallet_balance?: number | null
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          average_rating?: number | null
          boroughs?: string[] | null
          category?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          moderation_status?: string | null
          name?: string
          neighborhoods?: string[] | null
          owner_id?: string
          phone?: string | null
          review_count?: number | null
          short_description?: string | null
          social_media?: Json | null
          total_bookings?: number | null
          total_orders?: number | null
          updated_at?: string | null
          verified?: boolean | null
          wallet_balance?: number | null
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          business_id: string | null
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          recipient_id: string
          sender_id: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_id: string
          price_at_time: number
          product_id: string | null
          quantity: number
          service_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_id: string
          price_at_time: number
          product_id?: string | null
          quantity?: number
          service_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_id?: string
          price_at_time?: number
          product_id?: string | null
          quantity?: number
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_id: string
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          promo_code_id: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          promo_code_id?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          promo_code_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business_id: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_urls: string[] | null
          in_stock: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_urls?: string[] | null
          in_stock?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_urls?: string[] | null
          in_stock?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_listing_count: number | null
          created_at: string | null
          email: string | null
          full_name: string | null
          has_completed_onboarding: boolean | null
          id: string
          phone: string | null
          subscription_plan: string
          subscription_status: string | null
          updated_at: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          business_listing_count?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          phone?: string | null
          subscription_plan?: string
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          business_listing_count?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          phone?: string | null
          subscription_plan?: string
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          type: string
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          value: number
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          type: string
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          value: number
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          type?: string
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          value?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          reviewer_name: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewer_name: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewer_name?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          available: boolean | null
          business_id: string
          category: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          image_urls: string[] | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          business_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_urls?: string[] | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          business_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_urls?: string[] | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount: number
          bank_details: Json
          business_id: string
          created_at: string | null
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_details: Json
          business_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_details?: Json
          business_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_promo_codes: number
          pending_businesses: number
          pending_withdrawals: number
          total_admins: number
          total_businesses: number
          total_orders: number
          total_revenue: number
          total_users: number
        }[]
      }
      get_business_dashboard_stats: {
        Args: { business_uuid: string }
        Returns: {
          average_rating: number
          bookings: number
          revenue: number
          total_orders: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
