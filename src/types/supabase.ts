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
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          username: string
          avatar_url: string | null
          bio: string | null
          location: string | null
          lunch_preferences: Json | null
          last_active: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          lunch_preferences?: Json | null
          last_active?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          lunch_preferences?: Json | null
          last_active?: string
        }
      }
      likes: {
        Row: {
          id: string
          created_at: string
          from_user_id: string
          to_user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          from_user_id: string
          to_user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          from_user_id?: string
          to_user_id?: string
        }
      }
      matches: {
        Row: {
          id: string
          created_at: string
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id_1: string
          user_id_2: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id_1?: string
          user_id_2?: string
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          match_id: string
          sender_id: string
          content: string
          read_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          match_id: string
          sender_id: string
          content: string
          read_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          match_id?: string
          sender_id?: string
          content?: string
          read_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}