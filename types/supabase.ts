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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_poster_generations: {
        Row: {
          color_scheme: string
          created_at: string
          dish_names: string[]
          dish_prices: Json | null
          error_message: string | null
          id: string
          image_path: string | null
          image_url: string | null
          order_phone: string | null
          owner_id: string
          prompt: string
          qr_url: string | null
          ratio: string
          restaurant_id: string
          status: string
          template_key: string
        }
        Insert: {
          color_scheme?: string
          created_at?: string
          dish_names?: string[]
          dish_prices?: Json | null
          error_message?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          order_phone?: string | null
          owner_id: string
          prompt: string
          qr_url?: string | null
          ratio?: string
          restaurant_id: string
          status?: string
          template_key?: string
        }
        Update: {
          color_scheme?: string
          created_at?: string
          dish_names?: string[]
          dish_prices?: Json | null
          error_message?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          order_phone?: string | null
          owner_id?: string
          prompt?: string
          qr_url?: string | null
          ratio?: string
          restaurant_id?: string
          status?: string
          template_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_poster_generations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name_en: string
          name_ur: string | null
          restaurant_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name_en: string
          name_ur?: string | null
          restaurant_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name_en?: string
          name_ur?: string | null
          restaurant_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      customer_audit_log: {
        Row: {
          action: string
          created_at: string | null
          customer_id: string | null
          details: Json | null
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          customer_id?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          customer_id?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      customer_notifications: {
        Row: {
          body_en: string | null
          body_ur: string | null
          created_at: string | null
          customer_id: string
          data: Json | null
          id: string
          is_read: boolean | null
          order_id: string
          title_en: string
          title_ur: string | null
          type: string
        }
        Insert: {
          body_en?: string | null
          body_ur?: string | null
          created_at?: string | null
          customer_id: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          order_id: string
          title_en: string
          title_ur?: string | null
          type?: string
        }
        Update: {
          body_en?: string | null
          body_ur?: string | null
          created_at?: string | null
          customer_id?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          order_id?: string
          title_en?: string
          title_ur?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          last_login: string | null
          name: string | null
          phone: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          last_login?: string | null
          name?: string | null
          phone?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_login?: string | null
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          created_at: string
          deal_type: string
          deal_value: number
          description_en: string | null
          description_ur: string | null
          dish_id: string | null
          end_date: string | null
          id: string
          is_active: boolean
          restaurant_id: string
          start_date: string | null
          title_en: string
          title_ur: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_type: string
          deal_value: number
          description_en?: string | null
          description_ur?: string | null
          dish_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          restaurant_id: string
          start_date?: string | null
          title_en: string
          title_ur?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_type?: string
          deal_value?: number
          description_en?: string | null
          description_ur?: string | null
          dish_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          restaurant_id?: string
          start_date?: string | null
          title_en?: string
          title_ur?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          category_id: string | null
          created_at: string | null
          description_en: string | null
          description_ur: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name_en: string
          name_ur: string | null
          price: number
          restaurant_id: string
          sort_order: number | null
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description_en?: string | null
          description_ur?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name_en: string
          name_ur?: string | null
          price: number
          restaurant_id: string
          sort_order?: number | null
          tags?: Json | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description_en?: string | null
          description_ur?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name_en?: string
          name_ur?: string | null
          price?: number
          restaurant_id?: string
          sort_order?: number | null
          tags?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dishes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempted_at: string
          email: string
          id: string
          ip_address: string
          success: boolean
        }
        Insert: {
          attempted_at?: string
          email: string
          id?: string
          ip_address?: string
          success?: boolean
        }
        Update: {
          attempted_at?: string
          email?: string
          id?: string
          ip_address?: string
          success?: boolean
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          recipient_email: string | null
          restaurant_id: string | null
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          recipient_email?: string | null
          restaurant_id?: string | null
          status?: string | null
          type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          recipient_email?: string | null
          restaurant_id?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          deal_id: string | null
          delivery_address: string | null
          delivery_fee: number | null
          discount_amount: number
          email_sent: boolean | null
          id: string
          items: Json
          order_number: string
          order_status: string | null
          order_type: string
          payment_method: string | null
          payment_status: string | null
          prepared_at: string | null
          ready_at: string | null
          restaurant_id: string
          table_id: string | null
          table_number: string | null
          total_price: number
          updated_at: string | null
          whatsapp_sent: boolean | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          deal_id?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          discount_amount?: number
          email_sent?: boolean | null
          id?: string
          items: Json
          order_number: string
          order_status?: string | null
          order_type: string
          payment_method?: string | null
          payment_status?: string | null
          prepared_at?: string | null
          ready_at?: string | null
          restaurant_id: string
          table_id?: string | null
          table_number?: string | null
          total_price: number
          updated_at?: string | null
          whatsapp_sent?: boolean | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          deal_id?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          discount_amount?: number
          email_sent?: boolean | null
          id?: string
          items?: Json
          order_number?: string
          order_status?: string | null
          order_type?: string
          payment_method?: string | null
          payment_status?: string | null
          prepared_at?: string | null
          ready_at?: string | null
          restaurant_id?: string
          table_id?: string | null
          table_number?: string | null
          total_price?: number
          updated_at?: string | null
          whatsapp_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          owner_id: string
          restaurant_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          owner_id: string
          restaurant_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          owner_id?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_audit_log_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_notifications: {
        Row: {
          announcement_id: string | null
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          link_url: string | null
          play_sound: boolean
          restaurant_id: string | null
          title: string
          type: string
        }
        Insert: {
          announcement_id?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          play_sound?: boolean
          restaurant_id?: string | null
          title: string
          type?: string
        }
        Update: {
          announcement_id?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          play_sound?: boolean
          restaurant_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_notifications_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "qr_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_notifications_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          analytics: boolean
          billing_interval: string
          can_have_qr: boolean
          can_have_tables: boolean
          can_have_whatsapp: boolean
          created_at: string
          custom_branding: boolean
          custom_features: Json | null
          description: string | null
          id: string
          is_active: boolean
          max_categories: number
          max_dishes: number
          max_images: number
          max_orders: number
          name: string
          offer_label: string | null
          offer_price_pkr: number | null
          original_price_pkr: number | null
          price_pkr: number
          slug: string
          sort_order: number
          updated_at: string
          yearly_price_pkr: number | null
        }
        Insert: {
          analytics?: boolean
          billing_interval?: string
          can_have_qr?: boolean
          can_have_tables?: boolean
          can_have_whatsapp?: boolean
          created_at?: string
          custom_branding?: boolean
          custom_features?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_categories?: number
          max_dishes?: number
          max_images?: number
          max_orders?: number
          name: string
          offer_label?: string | null
          offer_price_pkr?: number | null
          original_price_pkr?: number | null
          price_pkr?: number
          slug: string
          sort_order?: number
          updated_at?: string
          yearly_price_pkr?: number | null
        }
        Update: {
          analytics?: boolean
          billing_interval?: string
          can_have_qr?: boolean
          can_have_tables?: boolean
          can_have_whatsapp?: boolean
          created_at?: string
          custom_branding?: boolean
          custom_features?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_categories?: number
          max_dishes?: number
          max_images?: number
          max_orders?: number
          name?: string
          offer_label?: string | null
          offer_price_pkr?: number | null
          original_price_pkr?: number | null
          price_pkr?: number
          slug?: string
          sort_order?: number
          updated_at?: string
          yearly_price_pkr?: number | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          customer_id: string | null
          endpoint: string
          id: string
          order_id: string | null
          p256dh_key: string
          restaurant_id: string
          user_agent: string | null
        }
        Insert: {
          auth_key: string
          created_at?: string
          customer_id?: string | null
          endpoint: string
          id?: string
          order_id?: string | null
          p256dh_key: string
          restaurant_id: string
          user_agent?: string | null
        }
        Update: {
          auth_key?: string
          created_at?: string
          customer_id?: string | null
          endpoint?: string
          id?: string
          order_id?: string | null
          p256dh_key?: string
          restaurant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_announcements: {
        Row: {
          audience: string
          body: string
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audience?: string
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      restaurant_signup_verification: {
        Row: {
          action_link: string | null
          attempts: number
          code_hash: string
          created_at: string
          email: string
          expires_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_link?: string | null
          attempts?: number
          code_hash: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_link?: string | null
          attempts?: number
          code_hash?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          capacity: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_occupied: boolean
          restaurant_id: string
          table_number: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_occupied?: boolean
          restaurant_id: string
          table_number: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_occupied?: boolean
          restaurant_id?: string
          table_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          ai_credits_used: number | null
          banner_enabled: boolean | null
          banner_image_url: string | null
          banner_link_url: string | null
          brand_accent_color: string | null
          brand_primary_color: string | null
          city: string
          closing_time: string | null
          created_at: string | null
          cuisine_type: string | null
          delivery_fee: number | null
          delivery_time_min: number | null
          description: string | null
          id: string
          image_upload_allowed: boolean | null
          is_active: boolean | null
          is_open: boolean
          is_suspended: boolean | null
          language: string | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          name: string
          name_ur: string | null
          old_slug: string | null
          opening_hours: Json | null
          opening_time: string | null
          owner_id: string | null
          payment_qr_url: string | null
          payment_till_id: string | null
          phone: string | null
          plan: string | null
          plan_end_date: string | null
          plan_limits_override: Json | null
          plan_start_date: string | null
          requested_plan: string | null
          slug: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          ai_credits_used?: number | null
          banner_enabled?: boolean | null
          banner_image_url?: string | null
          banner_link_url?: string | null
          brand_accent_color?: string | null
          brand_primary_color?: string | null
          city: string
          closing_time?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          delivery_fee?: number | null
          delivery_time_min?: number | null
          description?: string | null
          id?: string
          image_upload_allowed?: boolean | null
          is_active?: boolean | null
          is_open?: boolean
          is_suspended?: boolean | null
          language?: string | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name: string
          name_ur?: string | null
          old_slug?: string | null
          opening_hours?: Json | null
          opening_time?: string | null
          owner_id?: string | null
          payment_qr_url?: string | null
          payment_till_id?: string | null
          phone?: string | null
          plan?: string | null
          plan_end_date?: string | null
          plan_limits_override?: Json | null
          plan_start_date?: string | null
          requested_plan?: string | null
          slug: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          ai_credits_used?: number | null
          banner_enabled?: boolean | null
          banner_image_url?: string | null
          banner_link_url?: string | null
          brand_accent_color?: string | null
          brand_primary_color?: string | null
          city?: string
          closing_time?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          delivery_fee?: number | null
          delivery_time_min?: number | null
          description?: string | null
          id?: string
          image_upload_allowed?: boolean | null
          is_active?: boolean | null
          is_open?: boolean
          is_suspended?: boolean | null
          language?: string | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string
          name_ur?: string | null
          old_slug?: string | null
          opening_hours?: Json | null
          opening_time?: string | null
          owner_id?: string | null
          payment_qr_url?: string | null
          payment_till_id?: string | null
          phone?: string | null
          plan?: string | null
          plan_end_date?: string | null
          plan_limits_override?: Json | null
          plan_start_date?: string | null
          requested_plan?: string | null
          slug?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          activated_by: string | null
          amount_pkr: number
          billing_interval: string | null
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_ref: string | null
          plan: string
          restaurant_id: string
          start_date: string | null
          status: string
          transaction_ref: string | null
        }
        Insert: {
          activated_by?: string | null
          amount_pkr: number
          billing_interval?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_ref?: string | null
          plan: string
          restaurant_id: string
          start_date?: string | null
          status?: string
          transaction_ref?: string | null
        }
        Update: {
          activated_by?: string | null
          amount_pkr?: number
          billing_interval?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_ref?: string | null
          plan?: string
          restaurant_id?: string
          start_date?: string | null
          status?: string
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      superadmin_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          email: string
          id: string
          ip_address: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          email: string
          id?: string
          ip_address?: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          email?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      superadmin_login_attempts: {
        Row: {
          attempted_at: string
          browser_fingerprint: string
          email: string
          id: string
          ip_address: string
          success: boolean
        }
        Insert: {
          attempted_at?: string
          browser_fingerprint?: string
          email: string
          id?: string
          ip_address?: string
          success?: boolean
        }
        Update: {
          attempted_at?: string
          browser_fingerprint?: string
          email?: string
          id?: string
          ip_address?: string
          success?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      daily_order_stats: {
        Row: {
          order_date: string | null
          restaurant_id: string | null
          total_orders: number | null
          total_revenue: number | null
          unique_customers: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_rate_limits: { Args: never; Returns: undefined }
      is_super_admin: { Args: { user_email: string }; Returns: boolean }
      refresh_daily_stats_cron: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      attendance_status: "present" | "absent" | "late" | "excused"
      link_status: "pending" | "approved" | "rejected"
      user_role: "superadmin" | "admin" | "teacher" | "student" | "parent"
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
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
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
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
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
    ? keyof (DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"])
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"])[EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attendance_status: ["present", "absent", "late", "excused"],
      link_status: ["pending", "approved", "rejected"],
      user_role: ["superadmin", "admin", "teacher", "student", "parent"],
    },
  },
} as const
