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
          id: number
          nickname: string
          grade: string
          department: string
          end_time: string | null
          place: string | null
          is_matched: boolean
          recruiting_since: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nickname: string
          grade: string
          department: string
          end_time?: string | null
          place?: string | null
          is_matched?: boolean
          recruiting_since?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nickname?: string
          grade?: string
          department?: string
          end_time?: string | null
          place?: string | null
          is_matched?: boolean
          recruiting_since?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          from_user_id: number
          to_user_id: number
          created_at: string
        }
        Insert: {
          from_user_id: number
          to_user_id: number
          created_at?: string
        }
        Update: {
          from_user_id?: number
          to_user_id?: number
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: number
          user_id_1: number
          user_id_2: number
          created_at: string
          is_canceled: boolean
        }
        Insert: {
          id?: number
          user_id_1: number
          user_id_2: number
          created_at?: string
          is_canceled?: boolean
        }
        Update: {
          id?: number
          user_id_1?: number
          user_id_2?: number
          created_at?: string
          is_canceled?: boolean
        }
      }
      messages: {
        Row: {
          id: number
          match_id: number
          from_user_id: number
          content: string
          created_at: string
        }
        Insert: {
          id?: number
          match_id: number
          from_user_id: number
          content: string
          created_at?: string
        }
        Update: {
          id?: number
          match_id?: number
          from_user_id?: number
          content?: string
          created_at?: string
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
