import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          postcode: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      cases: {
        Row: {
          id: string;
          user_id: string;
          deceased_name: string;
          date_of_death: string;
          location_of_death: string;
          current_location: string;
          relationship: string;
          postcode: string;
          funeral_preference: string;
          faith: string;
          housing_type: string;
          receiving_benefits: string;
          needs_financial_help: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cases"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["cases"]["Insert"]>;
      };
      tasks: {
        Row: {
          id: string;
          case_id: string;
          title: string;
          description: string;
          category: string;
          priority: string;
          status: string;
          assigned_to: string | null;
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tasks"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
      };
      family_members: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          name: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["family_members"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["family_members"]["Insert"]>;
      };
      ai_conversations: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          messages: {role: string; content: string}[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ai_conversations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["ai_conversations"]["Insert"]>;
      };
    };
  };
};
