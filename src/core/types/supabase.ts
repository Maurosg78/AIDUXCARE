export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          full_name: string
          birth_date: string
          sex: string
          clinical_history: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['patients']['Insert']>
      }
      visits: {
        Row: {
          id: string
          patient_id: string
          professional_id: string
          date: string
          reason: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['visits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['visits']['Insert']>
      }
    }
  }
} 