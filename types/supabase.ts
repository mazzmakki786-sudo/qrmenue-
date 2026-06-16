export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          class_id: string | null
          content: string
          created_at: string | null
          created_by: string
          id: string
          target_role: Database["public"]["Enums"]["user_role"] | null
          title: string
        }
        Insert: {
          class_id?: string | null
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          target_role?: Database["public"]["Enums"]["user_role"] | null
          title: string
        }
        Update: {
          class_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          target_role?: Database["public"]["Enums"]["user_role"] | null
          title?: string
        }
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
      }
      classes: {
        Row: {
          academic_year: string
          id: string
          name: string
          section: string | null
        }
        Insert: {
          academic_year: string
          id?: string
          name: string
          section?: string | null
        }
        Update: {
          academic_year?: string
          id?: string
          name?: string
          section?: string | null
        }
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
          type: string
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
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_address: string | null
          email_sent: boolean | null
          id: string
          items: Json
          order_number: string
          order_status: string | null
          order_type: string
          payment_method: string | null
          payment_status: string | null
          restaurant_id: string
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
          delivery_address?: string | null
          email_sent?: boolean | null
          id?: string
          items: Json
          order_number: string
          order_status?: string | null
          order_type: string
          payment_method?: string | null
          payment_status?: string | null
          restaurant_id: string
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
          delivery_address?: string | null
          email_sent?: boolean | null
          id?: string
          items?: Json
          order_number?: string
          order_status?: string | null
          order_type?: string
          payment_method?: string | null
          payment_status?: string | null
          restaurant_id?: string
          table_number?: string | null
          total_price?: number
          updated_at?: string | null
          whatsapp_sent?: boolean | null
        }
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
      }
      owner_notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          link_url: string | null
          restaurant_id: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          restaurant_id?: string | null
          title: string
          type?: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          restaurant_id?: string | null
          title?: string
          type?: string
        }
      }
      parent_students: {
        Row: {
          approved_at: string | null
          id: string
          parent_id: string
          relationship: string | null
          requested_at: string | null
          status: Database["public"]["Enums"]["link_status"]
          student_id: string
        }
        Insert: {
          approved_at?: string | null
          id?: string
          parent_id: string
          relationship?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["link_status"]
          student_id: string
        }
        Update: {
          approved_at?: string | null
          id?: string
          parent_id?: string
          relationship?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["link_status"]
          student_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          intron_email: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          unique_student_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          intron_email?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          unique_student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          intron_email?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          unique_student_id?: string | null
          updated_at?: string | null
        }
      }
      qr_announcements: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
        }
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
      }
      restaurants: {
        Row: {
          address: string | null
          banner_enabled: boolean | null
          banner_image_url: string | null
          banner_link_url: string | null
          brand_accent_color: string | null
          brand_primary_color: string | null
          city: string
          created_at: string | null
          cuisine_type: string | null
          id: string
          image_upload_allowed: boolean | null
          is_active: boolean | null
          is_suspended: boolean | null
          language: string | null
          logo_url: string | null
          name: string
          name_ur: string | null
          owner_id: string | null
          phone: string | null
          plan: string | null
          plan_end_date: string | null
          plan_limits_override: Json | null
          plan_start_date: string | null
          slug: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          banner_enabled?: boolean | null
          banner_image_url?: string | null
          banner_link_url?: string | null
          brand_accent_color?: string | null
          brand_primary_color?: string | null
          city: string
          created_at?: string | null
          cuisine_type?: string | null
          id?: string
          image_upload_allowed?: boolean | null
          is_active?: boolean | null
          is_suspended?: boolean | null
          language?: string | null
          logo_url?: string | null
          name: string
          name_ur?: string | null
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          plan_end_date?: string | null
          plan_limits_override?: Json | null
          plan_start_date?: string | null
          slug: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          banner_enabled?: boolean | null
          banner_image_url?: string | null
          banner_link_url?: string | null
          brand_accent_color?: string | null
          brand_primary_color?: string | null
          city?: string
          created_at?: string | null
          cuisine_type?: string | null
          id?: string
          image_upload_allowed?: boolean | null
          is_active?: boolean | null
          is_suspended?: boolean | null
          language?: string | null
          logo_url?: string | null
          name?: string
          name_ur?: string | null
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          plan_end_date?: string | null
          plan_limits_override?: Json | null
          plan_start_date?: string | null
          slug?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
      }
      subjects: {
        Row: {
          class_id: string
          code: string
          id: string
          name: string
        }
        Insert: {
          class_id: string
          code: string
          id?: string
          name: string
        }
        Update: {
          class_id?: string
          code?: string
          id?: string
          name?: string
        }
      }
      subscriptions: {
        Row: {
          activated_by: string | null
          amount_pkr: number
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_ref: string | null
          plan: string
          restaurant_id: string
          start_date: string | null
        }
        Insert: {
          activated_by?: string | null
          amount_pkr: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_ref?: string | null
          plan: string
          restaurant_id: string
          start_date?: string | null
        }
        Update: {
          activated_by?: string | null
          amount_pkr?: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_ref?: string | null
          plan?: string
          restaurant_id?: string
          start_date?: string | null
        }
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
      }
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      attendance_status: "present" | "absent" | "late" | "excused"
      link_status: "pending" | "approved" | "rejected"
      user_role: "superadmin" | "admin" | "teacher" | "student" | "parent"
    }
  }
}
