// User Types
export enum UserRole {
  USER = 'user',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export interface OnboardingData {
  name: string;
  useCase: 'work' | 'hobby' | 'education' | null;
  usageMode: 'solo' | 'team' | null;
}

export interface User {
  id: string;
  google_id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  profile_picture?: string;
  displayName?: string;
  password?: string; // For email/password signup
  onboarding_status?: boolean; // Track if user has completed onboarding
  onboarding_data?: OnboardingData; // Store onboarding responses
}

// Material/Resource Types
export enum MaterialStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  subject?: string;
  uploader_id: string;
  uploader_username: string;
  uploader_email?: string;
  uploader_profile_picture?: string;
  file_url?: string;
  file_type?: string;
  file_size?: string;
  status: MaterialStatus;
  tags: string[];
  downloads: number;
  views: number;
  rating: number;
  ratings_count: number;
  created_at: string;
  approved_at?: string;
}

// Admin Types
export interface ModerationRule {
  id: string;
  name: string;
  description: string;
  rule_type: 'keyword' | 'file_size' | 'file_type';
  rule_value: string;
  action: 'auto_approve' | 'auto_reject' | 'flag_for_review';
  enabled: boolean;
  created_at: string;
}

export interface PlatformConfig {
  id: string;
  key: string;
  value: string | number | boolean;
  description: string;
  updated_at: string;
  updated_by: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
  enabled: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  targetId: string;
  targetType: 'user' | 'material' | 'report';
  details: Record<string, any>;
  timestamp: string;
}

export interface PlatformStats {
  total_users: number;
  total_materials: number;
  approved_materials: number;
  pending_materials: number;
  total_downloads: number;
  total_reports: number;
  last_updated: string;
}
