export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: string;
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          body: string;
          tags: string[];
          favorite: boolean;
          last_used_at: string | null;
          ai_improved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          body?: string;
          tags?: string[];
          favorite?: boolean;
          last_used_at?: string | null;
          ai_improved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          body?: string;
          tags?: string[];
          favorite?: boolean;
          last_used_at?: string | null;
          ai_improved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_variables: {
        Row: {
          id: string;
          prompt_id: string;
          name: string;
          label: string;
          placeholder: string;
          default_value: string;
          required: boolean;
          multiline: boolean;
          position: number;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          name: string;
          label?: string;
          placeholder?: string;
          default_value?: string;
          required?: boolean;
          multiline?: boolean;
          position?: number;
        };
        Update: {
          id?: string;
          prompt_id?: string;
          name?: string;
          label?: string;
          placeholder?: string;
          default_value?: string;
          required?: boolean;
          multiline?: boolean;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_variables_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
