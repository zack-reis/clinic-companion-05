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
      consulta: {
        Row: {
          created_at: string
          data_consulta: string
          hora_consulta: string
          id: string
          id_medico: string
          id_paciente: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_consulta: string
          hora_consulta: string
          id?: string
          id_medico: string
          id_paciente: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_consulta?: string
          hora_consulta?: string
          id?: string
          id_medico?: string
          id_paciente?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consulta_id_medico_fkey"
            columns: ["id_medico"]
            isOneToOne: false
            referencedRelation: "medico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consulta_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "paciente"
            referencedColumns: ["id"]
          },
        ]
      }
      especialidade: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome_especialidade: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome_especialidade: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome_especialidade?: string
          user_id?: string
        }
        Relationships: []
      }
      medicamento: {
        Row: {
          created_at: string
          dosagem_padrao: string | null
          fabricante: string | null
          id: string
          nome_comercial: string | null
          nome_generico: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosagem_padrao?: string | null
          fabricante?: string | null
          id?: string
          nome_comercial?: string | null
          nome_generico: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosagem_padrao?: string | null
          fabricante?: string | null
          id?: string
          nome_comercial?: string | null
          nome_generico?: string
          user_id?: string
        }
        Relationships: []
      }
      medico: {
        Row: {
          created_at: string
          crm: string
          email: string | null
          id: string
          id_especialidade: string | null
          nome: string
          telefone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          crm: string
          email?: string | null
          id?: string
          id_especialidade?: string | null
          nome: string
          telefone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          crm?: string
          email?: string | null
          id?: string
          id_especialidade?: string | null
          nome?: string
          telefone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medico_id_especialidade_fkey"
            columns: ["id_especialidade"]
            isOneToOne: false
            referencedRelation: "especialidade"
            referencedColumns: ["id"]
          },
        ]
      }
      paciente: {
        Row: {
          cpf: string | null
          created_at: string
          data_nascimento: string
          endereco: string | null
          id: string
          id_plano: string | null
          nome: string
          sexo: Database["public"]["Enums"]["sexo_enum"] | null
          telefone: string | null
          user_id: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_nascimento: string
          endereco?: string | null
          id?: string
          id_plano?: string | null
          nome: string
          sexo?: Database["public"]["Enums"]["sexo_enum"] | null
          telefone?: string | null
          user_id: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string
          endereco?: string | null
          id?: string
          id_plano?: string | null
          nome?: string
          sexo?: Database["public"]["Enums"]["sexo_enum"] | null
          telefone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paciente_id_plano_fkey"
            columns: ["id_plano"]
            isOneToOne: false
            referencedRelation: "plano_saude"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_saude: {
        Row: {
          created_at: string
          id: string
          nome_plano: string
          operadora: string | null
          telefone_contato: string | null
          tipo_plano: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_plano: string
          operadora?: string | null
          telefone_contato?: string | null
          tipo_plano?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_plano?: string
          operadora?: string | null
          telefone_contato?: string | null
          tipo_plano?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prescricao: {
        Row: {
          created_at: string
          id: string
          id_medicamento: string
          id_prontuario: string
          instrucoes_uso: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_medicamento: string
          id_prontuario: string
          instrucoes_uso?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          id_medicamento?: string
          id_prontuario?: string
          instrucoes_uso?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescricao_id_medicamento_fkey"
            columns: ["id_medicamento"]
            isOneToOne: false
            referencedRelation: "medicamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricao_id_prontuario_fkey"
            columns: ["id_prontuario"]
            isOneToOne: false
            referencedRelation: "prontuario"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string | null
        }
        Insert: {
          created_at?: string
          id: string
          nome?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      prontuario: {
        Row: {
          anamnese: string | null
          data_registro: string
          diagnostico: string | null
          id: string
          id_consulta: string
          id_paciente: string
          user_id: string
        }
        Insert: {
          anamnese?: string | null
          data_registro?: string
          diagnostico?: string | null
          id?: string
          id_consulta: string
          id_paciente: string
          user_id: string
        }
        Update: {
          anamnese?: string | null
          data_registro?: string
          diagnostico?: string | null
          id?: string
          id_consulta?: string
          id_paciente?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prontuario_id_consulta_fkey"
            columns: ["id_consulta"]
            isOneToOne: true
            referencedRelation: "consulta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuario_id_paciente_fkey"
            columns: ["id_paciente"]
            isOneToOne: false
            referencedRelation: "paciente"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      sexo_enum: "M" | "F"
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
    Enums: {
      sexo_enum: ["M", "F"],
    },
  },
} as const
