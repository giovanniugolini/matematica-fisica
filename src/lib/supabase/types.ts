export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          role: 'student' | 'teacher' | 'admin'
          plan: 'free' | 'pro' | 'school'
          ai_credits_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'teacher' | 'admin'
          plan?: 'free' | 'pro' | 'school'
          ai_credits_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'teacher' | 'admin'
          plan?: 'free' | 'pro' | 'school'
          ai_credits_used?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      artifacts: {
        Row: {
          id: string
          owner_id: string
          type: 'lesson' | 'demo' | 'quiz' | 'path'
          title: string
          description: string | null
          subject: 'matematica' | 'fisica' | null
          topic: string | null
          level: 'base' | 'intermedio' | 'avanzato' | null
          status: 'draft' | 'published' | 'archived'
          visibility: 'public' | 'private' | 'unlisted'
          content: Json
          source_md: string | null
          forked_from: string | null
          likes_count: number
          views_count: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          type: 'lesson' | 'demo' | 'quiz' | 'path'
          title: string
          description?: string | null
          subject?: 'matematica' | 'fisica' | null
          topic?: string | null
          level?: 'base' | 'intermedio' | 'avanzato' | null
          status?: 'draft' | 'published' | 'archived'
          visibility?: 'public' | 'private' | 'unlisted'
          content?: Json
          source_md?: string | null
          forked_from?: string | null
          likes_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          type?: 'lesson' | 'demo' | 'quiz' | 'path'
          title?: string
          description?: string | null
          subject?: 'matematica' | 'fisica' | null
          topic?: string | null
          level?: 'base' | 'intermedio' | 'avanzato' | null
          status?: 'draft' | 'published' | 'archived'
          visibility?: 'public' | 'private' | 'unlisted'
          content?: Json
          source_md?: string | null
          forked_from?: string | null
          likes_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          id: string
          quiz_id: string
          user_id: string | null
          score: number
          max_score: number
          percentage: number
          answers: Json
          time_spent: number | null
          completed_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id?: string | null
          score: number
          max_score: number
          answers: Json
          time_spent?: number | null
          completed_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string | null
          score?: number
          max_score?: number
          answers?: Json
          time_spent?: number | null
          completed_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          user_id: string
          artifact_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          artifact_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          artifact_id?: string
          created_at?: string
        }
        Relationships: []
      }
      path_items: {
        Row: {
          id: string
          path_id: string
          artifact_id: string
          order_index: number
          is_required: boolean
        }
        Insert: {
          id?: string
          path_id: string
          artifact_id: string
          order_index: number
          is_required?: boolean
        }
        Update: {
          id?: string
          path_id?: string
          artifact_id?: string
          order_index?: number
          is_required?: boolean
        }
        Relationships: []
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

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Artifact = Tables<'artifacts'>
export type QuizResult = Tables<'quiz_results'>
export type Favorite = Tables<'favorites'>
export type PathItem = Tables<'path_items'>

export type NewArtifact = InsertTables<'artifacts'>
export type UpdateArtifact = UpdateTables<'artifacts'>
