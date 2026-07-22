export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "administrador" | "operador" | "consulta";
export type MigrationStatus =
  | "dry_run"
  | "running"
  | "completed"
  | "failed"
  | "validated";
export type MigrationIssueSeverity =
  | "bloqueia_migracao"
  | "pode_migrar_com_alerta"
  | "pode_ser_corrigido_depois";
export type SystemStatus =
  | "operacional"
  | "manutencao"
  | "indisponivel"
  | "em_desenvolvimento";
export type NoticeStatus = "ativo" | "rascunho" | "arquivado";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string;
          role?: UserRole;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      unidades: {
        Row: {
          id: string;
          legacy_id: number | null;
          nome: string;
          sigla: string | null;
          tipo: string;
          status: string;
          endereco: string | null;
          coordenador: string | null;
          telefone: string | null;
          legacy_criado_em: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          legacy_id?: number | null;
          nome: string;
          sigla?: string | null;
          tipo: string;
          status?: string;
          endereco?: string | null;
          coordenador?: string | null;
          telefone?: string | null;
          legacy_criado_em?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          legacy_id?: number | null;
          nome?: string;
          sigla?: string | null;
          tipo?: string;
          status?: string;
          endereco?: string | null;
          coordenador?: string | null;
          telefone?: string | null;
          legacy_criado_em?: string | null;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      funcionarios: {
        Row: {
          id: string;
          legacy_id: number | null;
          nome: string;
          cpf: string | null;
          cpf_normalized: string | null;
          nascimento: string | null;
          cargo: string | null;
          setor: string | null;
          escolaridade: string | null;
          unidade_id: string | null;
          legacy_unidade_id: number | null;
          vinculo: string | null;
          carga_horaria: string | null;
          telefone: string | null;
          email: string | null;
          admissao: string | null;
          data_exoneracao: string | null;
          status: string;
          observacoes: string | null;
          legacy_criado_em: string | null;
          legacy_atualizado_em: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          legacy_id?: number | null;
          nome: string;
          cpf?: string | null;
          cpf_normalized?: string | null;
          nascimento?: string | null;
          cargo?: string | null;
          setor?: string | null;
          escolaridade?: string | null;
          unidade_id?: string | null;
          legacy_unidade_id?: number | null;
          vinculo?: string | null;
          carga_horaria?: string | null;
          telefone?: string | null;
          email?: string | null;
          admissao?: string | null;
          data_exoneracao?: string | null;
          status?: string;
          observacoes?: string | null;
          legacy_criado_em?: string | null;
          legacy_atualizado_em?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Update: {
          nome?: string;
          cpf?: string | null;
          cpf_normalized?: string | null;
          nascimento?: string | null;
          cargo?: string | null;
          setor?: string | null;
          escolaridade?: string | null;
          unidade_id?: string | null;
          legacy_unidade_id?: number | null;
          vinculo?: string | null;
          carga_horaria?: string | null;
          telefone?: string | null;
          email?: string | null;
          admissao?: string | null;
          data_exoneracao?: string | null;
          status?: string;
          observacoes?: string | null;
          legacy_criado_em?: string | null;
          legacy_atualizado_em?: string | null;
          deleted_at?: string | null;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      historico_movimentacoes: {
        Row: {
          id: string;
          legacy_id: number | null;
          funcionario_id: string;
          funcionario_legacy_id: number | null;
          status_anterior: string | null;
          status_novo: string;
          data_movimentacao: string;
          observacao: string | null;
          performed_by: string | null;
          created_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          legacy_id?: number | null;
          funcionario_id: string;
          funcionario_legacy_id?: number | null;
          status_anterior?: string | null;
          status_novo: string;
          data_movimentacao: string;
          observacao?: string | null;
          performed_by?: string | null;
          created_at?: string;
          metadata?: Json;
        };
        Update: {
          funcionario_id?: string;
          funcionario_legacy_id?: number | null;
          status_anterior?: string | null;
          status_novo?: string;
          data_movimentacao?: string;
          observacao?: string | null;
          performed_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          entity_legacy_id: number | null;
          old_values: Json | null;
          new_values: Json | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          entity_legacy_id?: number | null;
          old_values?: Json | null;
          new_values?: Json | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          metadata?: Json;
        };
        Relationships: [];
      };
      migration_runs: {
        Row: {
          id: string;
          started_at: string;
          finished_at: string | null;
          status: MigrationStatus;
          source_hash: string;
          total_source_records: number;
          total_imported_records: number;
          total_failed_records: number;
          notes: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          started_at?: string;
          finished_at?: string | null;
          status?: MigrationStatus;
          source_hash: string;
          total_source_records?: number;
          total_imported_records?: number;
          total_failed_records?: number;
          notes?: string | null;
          metadata?: Json;
        };
        Update: {
          finished_at?: string | null;
          status?: MigrationStatus;
          total_source_records?: number;
          total_imported_records?: number;
          total_failed_records?: number;
          notes?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      migration_issues: {
        Row: {
          id: string;
          migration_run_id: string | null;
          entity_type: string;
          legacy_id: number | null;
          issue_type: string;
          severity: MigrationIssueSeverity;
          description: string;
          resolved: boolean;
          resolved_at: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          migration_run_id?: string | null;
          entity_type: string;
          legacy_id?: number | null;
          issue_type: string;
          severity: MigrationIssueSeverity;
          description: string;
          resolved?: boolean;
          resolved_at?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          migration_run_id?: string | null;
          severity?: MigrationIssueSeverity;
          description?: string;
          resolved?: boolean;
          resolved_at?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      systems: {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_name: string;
          description: string;
          details: string[];
          icon_name: "users" | "chart";
          access_type: string;
          status: SystemStatus;
          url: string | null;
          address_label: string;
          authorized_audience: string;
          restriction_message: string;
          color: "blue" | "green";
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          short_name: string;
          description: string;
          details?: string[];
          icon_name: "users" | "chart";
          access_type: string;
          status?: SystemStatus;
          url?: string | null;
          address_label?: string;
          authorized_audience: string;
          restriction_message: string;
          color?: "blue" | "green";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          short_name?: string;
          description?: string;
          details?: string[];
          icon_name?: "users" | "chart";
          access_type?: string;
          status?: SystemStatus;
          url?: string | null;
          address_label?: string;
          authorized_audience?: string;
          restriction_message?: string;
          color?: "blue" | "green";
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      notices: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: NoticeStatus;
          href: string | null;
          published_at: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: NoticeStatus;
          href?: string | null;
          published_at?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          status?: NoticeStatus;
          href?: string | null;
          published_at?: string;
          expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      access_logs: {
        Row: {
          id: string;
          user_id: string | null;
          system_slug: string;
          status: SystemStatus | null;
          success: boolean;
          user_agent: string | null;
          ip_address: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          system_slug: string;
          status?: SystemStatus | null;
          success?: boolean;
          user_agent?: string | null;
          ip_address?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          status?: SystemStatus | null;
          success?: boolean;
          metadata?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: UserRole;
      migration_status: MigrationStatus;
      migration_issue_severity: MigrationIssueSeverity;
    };
    CompositeTypes: Record<string, never>;
  };
}
