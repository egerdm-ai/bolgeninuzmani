export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      applications: {
        Row: {
          company: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          message: string | null;
          phone: string;
          regions: string[];
          status: Database["public"]["Enums"]["application_status"];
        };
        Insert: {
          company?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          message?: string | null;
          phone: string;
          regions?: string[];
          status?: Database["public"]["Enums"]["application_status"];
        };
        Update: {
          company?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          message?: string | null;
          phone?: string;
          regions?: string[];
          status?: Database["public"]["Enums"]["application_status"];
        };
        Relationships: [];
      };
      detail_requests: {
        Row: {
          created_at: string;
          id: string;
          message: string | null;
          owner_id: string;
          portfolio_id: string;
          requester_id: string;
          response_message: string | null;
          status: Database["public"]["Enums"]["detail_request_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message?: string | null;
          owner_id: string;
          portfolio_id: string;
          requester_id: string;
          response_message?: string | null;
          status?: Database["public"]["Enums"]["detail_request_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string | null;
          owner_id?: string;
          portfolio_id?: string;
          requester_id?: string;
          response_message?: string | null;
          status?: Database["public"]["Enums"]["detail_request_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "detail_requests_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "detail_requests_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "detail_requests_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          created_at: string;
          follower_id: string;
          following_id: string;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          following_id: string;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [];
      };
      geo_districts: {
        Row: {
          district: string;
          lat: number;
          lng: number;
          province: string;
        };
        Insert: {
          district: string;
          lat: number;
          lng: number;
          province: string;
        };
        Update: {
          district?: string;
          lat?: number;
          lng?: number;
          province?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          kind: string;
          link: Json | null;
          read: boolean;
          title: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          kind: string;
          link?: Json | null;
          read?: boolean;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          kind?: string;
          link?: Json | null;
          read?: boolean;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      portfolio_access_grants: {
        Row: {
          created_at: string;
          expires_at: string | null;
          granted_by: string;
          grantee_id: string;
          id: string;
          portfolio_id: string;
          request_id: string | null;
          revoked_at: string | null;
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          granted_by: string;
          grantee_id: string;
          id?: string;
          portfolio_id: string;
          request_id?: string | null;
          revoked_at?: string | null;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          granted_by?: string;
          grantee_id?: string;
          id?: string;
          portfolio_id?: string;
          request_id?: string | null;
          revoked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_access_grants_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_access_grants_grantee_id_fkey";
            columns: ["grantee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_access_grants_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_access_grants_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "detail_requests";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_documents: {
        Row: {
          id: string;
          kind: Database["public"]["Enums"]["document_kind"];
          path: string;
          portfolio_id: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          kind?: Database["public"]["Enums"]["document_kind"];
          path: string;
          portfolio_id: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          kind?: Database["public"]["Enums"]["document_kind"];
          path?: string;
          portfolio_id?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_documents_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_images: {
        Row: {
          id: string;
          is_cover: boolean;
          path: string;
          portfolio_id: string;
          sort_order: number;
          visibility: Database["public"]["Enums"]["image_visibility"];
        };
        Insert: {
          id?: string;
          is_cover?: boolean;
          path: string;
          portfolio_id: string;
          sort_order?: number;
          visibility?: Database["public"]["Enums"]["image_visibility"];
        };
        Update: {
          id?: string;
          is_cover?: boolean;
          path?: string;
          portfolio_id?: string;
          sort_order?: number;
          visibility?: Database["public"]["Enums"]["image_visibility"];
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_images_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_private: {
        Row: {
          attributes: Json;
          exact_address: string | null;
          exact_lat: number | null;
          exact_lng: number | null;
          malik_info: Json | null;
          portfolio_id: string;
          private_description: string | null;
          private_notes: string | null;
        };
        Insert: {
          attributes?: Json;
          exact_address?: string | null;
          exact_lat?: number | null;
          exact_lng?: number | null;
          malik_info?: Json | null;
          portfolio_id: string;
          private_description?: string | null;
          private_notes?: string | null;
        };
        Update: {
          attributes?: Json;
          exact_address?: string | null;
          exact_lat?: number | null;
          exact_lng?: number | null;
          malik_info?: Json | null;
          portfolio_id?: string;
          private_description?: string | null;
          private_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_private_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: true;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolios: {
        Row: {
          approx_lat: number | null;
          approx_lng: number | null;
          attributes: Json;
          category: Database["public"]["Enums"]["portfolio_category"];
          city: string | null;
          created_at: string;
          currency: Database["public"]["Enums"]["currency"];
          district: string | null;
          features: string[];
          gross_m2: number | null;
          id: string;
          land_m2: number | null;
          mode: Database["public"]["Enums"]["portfolio_mode"];
          neighborhood: string | null;
          net_m2: number | null;
          owner_id: string;
          price: number | null;
          public_description: string | null;
          ref_no: string;
          room_count: string | null;
          slug: string;
          status: Database["public"]["Enums"]["portfolio_status"];
          subcategory: string | null;
          title: string;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at: string;
        };
        Insert: {
          approx_lat?: number | null;
          approx_lng?: number | null;
          attributes?: Json;
          category: Database["public"]["Enums"]["portfolio_category"];
          city?: string | null;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          district?: string | null;
          features?: string[];
          gross_m2?: number | null;
          id?: string;
          land_m2?: number | null;
          mode?: Database["public"]["Enums"]["portfolio_mode"];
          neighborhood?: string | null;
          net_m2?: number | null;
          owner_id: string;
          price?: number | null;
          public_description?: string | null;
          ref_no: string;
          room_count?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["portfolio_status"];
          subcategory?: string | null;
          title: string;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
        };
        Update: {
          approx_lat?: number | null;
          approx_lng?: number | null;
          attributes?: Json;
          category?: Database["public"]["Enums"]["portfolio_category"];
          city?: string | null;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          district?: string | null;
          features?: string[];
          gross_m2?: number | null;
          id?: string;
          land_m2?: number | null;
          mode?: Database["public"]["Enums"]["portfolio_mode"];
          neighborhood?: string | null;
          net_m2?: number | null;
          owner_id?: string;
          price?: number | null;
          public_description?: string | null;
          ref_no?: string;
          room_count?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["portfolio_status"];
          subcategory?: string | null;
          title?: string;
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolios_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          company_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          contact_whatsapp: string | null;
          created_at: string;
          expertise_regions: string[];
          expertise_types: string[];
          full_name: string;
          id: string;
          location: string | null;
          membership_tier: Database["public"]["Enums"]["membership_tier"];
          status: Database["public"]["Enums"]["profile_status"];
          title: string | null;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          company_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_whatsapp?: string | null;
          created_at?: string;
          expertise_regions?: string[];
          expertise_types?: string[];
          full_name: string;
          id: string;
          location?: string | null;
          membership_tier?: Database["public"]["Enums"]["membership_tier"];
          status?: Database["public"]["Enums"]["profile_status"];
          title?: string | null;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          company_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_whatsapp?: string | null;
          created_at?: string;
          expertise_regions?: string[];
          expertise_types?: string[];
          full_name?: string;
          id?: string;
          location?: string | null;
          membership_tier?: Database["public"]["Enums"]["membership_tier"];
          status?: Database["public"]["Enums"]["profile_status"];
          title?: string | null;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
      saved_portfolios: {
        Row: {
          created_at: string;
          portfolio_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          portfolio_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          portfolio_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_portfolios_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
        ];
      };
      searches: {
        Row: {
          budget_max: number | null;
          budget_min: number | null;
          category: Database["public"]["Enums"]["portfolio_category"];
          city: string | null;
          created_at: string;
          currency: Database["public"]["Enums"]["currency"];
          district: string | null;
          features: string[];
          id: string;
          min_m2: number | null;
          neighborhood: string | null;
          notes: string | null;
          owner_id: string;
          room_count: string | null;
          status: Database["public"]["Enums"]["search_status"];
          title: string;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at: string;
          urgency: Database["public"]["Enums"]["search_urgency"];
        };
        Insert: {
          budget_max?: number | null;
          budget_min?: number | null;
          category: Database["public"]["Enums"]["portfolio_category"];
          city?: string | null;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          district?: string | null;
          features?: string[];
          id?: string;
          min_m2?: number | null;
          neighborhood?: string | null;
          notes?: string | null;
          owner_id: string;
          room_count?: string | null;
          status?: Database["public"]["Enums"]["search_status"];
          title: string;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
          urgency?: Database["public"]["Enums"]["search_urgency"];
        };
        Update: {
          budget_max?: number | null;
          budget_min?: number | null;
          category?: Database["public"]["Enums"]["portfolio_category"];
          city?: string | null;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          district?: string | null;
          features?: string[];
          id?: string;
          min_m2?: number | null;
          neighborhood?: string | null;
          notes?: string | null;
          owner_id?: string;
          room_count?: string | null;
          status?: Database["public"]["Enums"]["search_status"];
          title?: string;
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
          urgency?: Database["public"]["Enums"]["search_urgency"];
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          granted_at: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          granted_at?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          granted_at?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      approve_detail_request: {
        Args: { _request_id: string; _response_message?: string };
        Returns: {
          created_at: string;
          expires_at: string | null;
          granted_by: string;
          grantee_id: string;
          id: string;
          portfolio_id: string;
          request_id: string | null;
          revoked_at: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "portfolio_access_grants";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      derive_approx: {
        Args: { _lat: number; _lng: number; _seed: string };
        Returns: {
          approx_lat: number;
          approx_lng: number;
        }[];
      };
      derive_approx_centroid: {
        Args: { _lat: number; _lng: number; _seed: string };
        Returns: {
          approx_lat: number;
          approx_lng: number;
        }[];
      };
      generate_portfolio_slug: { Args: { _title: string }; Returns: string };
      generate_ref_no: { Args: never; Returns: string };
      generate_username: { Args: { _email: string }; Returns: string };
      get_public_agent_portfolios: {
        Args: { _username: string };
        Returns: Json;
      };
      get_public_portfolio: { Args: { _slug: string }; Returns: Json };
      get_public_profile: { Args: { _username: string }; Returns: Json };
      get_region_experts: {
        Args: { _city: string; _district?: string; _exclude_owner?: string };
        Returns: Json;
      };
      get_region_summary: { Args: never; Returns: Json };
      has_portfolio_access: {
        Args: { _portfolio_id: string; _user_id?: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id?: string }; Returns: boolean };
      is_verified: { Args: { _user_id?: string }; Returns: boolean };
      match_search: { Args: { _search_id: string }; Returns: Json };
      owns_portfolio: {
        Args: { _portfolio_id: string; _user_id?: string };
        Returns: boolean;
      };
      portfolio_teaser_visible: {
        Args: { _portfolio_id: string; _user_id?: string };
        Returns: boolean;
      };
      reject_detail_request: {
        Args: { _request_id: string; _response_message?: string };
        Returns: {
          created_at: string;
          id: string;
          message: string | null;
          owner_id: string;
          portfolio_id: string;
          requester_id: string;
          response_message: string | null;
          status: Database["public"]["Enums"]["detail_request_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "detail_requests";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      request_detail: {
        Args: { _message?: string; _portfolio_id: string };
        Returns: {
          created_at: string;
          id: string;
          message: string | null;
          owner_id: string;
          portfolio_id: string;
          requester_id: string;
          response_message: string | null;
          status: Database["public"]["Enums"]["detail_request_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "detail_requests";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      to_base36: { Args: { _n: number }; Returns: string };
    };
    Enums: {
      app_role: "admin" | "agent";
      application_status: "new" | "reviewed" | "invited" | "rejected";
      currency: "TRY" | "USD" | "EUR";
      detail_request_status: "pending" | "approved" | "rejected";
      document_kind: "tapu" | "ruhsat" | "imar_plani" | "proje" | "pdf" | "diger";
      image_visibility: "public" | "locked";
      membership_tier: "standard" | "pro" | "elite";
      portfolio_category: "konut" | "ticari" | "arsa" | "turizm" | "isletme" | "ozel_varlik";
      portfolio_mode: "controlled" | "call_only";
      portfolio_status: "draft" | "active" | "passive" | "sold";
      profile_status: "pending" | "verified" | "suspended";
      search_status: "active" | "matched" | "closed";
      search_urgency: "low" | "medium" | "high";
      transaction_type: "satilik" | "kiralik";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "agent"],
      application_status: ["new", "reviewed", "invited", "rejected"],
      currency: ["TRY", "USD", "EUR"],
      detail_request_status: ["pending", "approved", "rejected"],
      document_kind: ["tapu", "ruhsat", "imar_plani", "proje", "pdf", "diger"],
      image_visibility: ["public", "locked"],
      membership_tier: ["standard", "pro", "elite"],
      portfolio_category: ["konut", "ticari", "arsa", "turizm", "isletme", "ozel_varlik"],
      portfolio_mode: ["controlled", "call_only"],
      portfolio_status: ["draft", "active", "passive", "sold"],
      profile_status: ["pending", "verified", "suspended"],
      search_status: ["active", "matched", "closed"],
      search_urgency: ["low", "medium", "high"],
      transaction_type: ["satilik", "kiralik"],
    },
  },
} as const;
