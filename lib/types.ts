export type FeatureName =
  | 'denoise'
  | 'sharpen'
  | 'scratch_cleanup'
  | 'color_correction'
  | 'face_enhancement'
  | 'colorization'
  | 'upscale_2x'
  | 'upscale_4x'

export type UpscaleOption = 'none' | '2x' | '4x'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface ProcessingOptions {
  denoise: boolean
  sharpen: boolean
  scratchCleanup: boolean
  colorCorrection: boolean
  faceEnhancement: boolean
  colorization: boolean
  upscale: UpscaleOption
}

export interface ProcessResult {
  jpegBuffer: Buffer
  featuresApplied: FeatureName[]
}

export interface Session {
  id: string
  user_name: string
  device_type: DeviceType
  features_used: FeatureName[]
  image_count: number
  created_at: string
}

export interface SiteSettings {
  bg_color: string
  hero_title: string
  hero_subtitle: string
  cta_text: string
  cta_color: string
  footer_text: string
  logo_url: string
}

export interface FeatureFlag {
  feature_name: string
  enabled: boolean
  updated_at: string
}

export interface AdminStats {
  sessions_today: number
  sessions_this_week: number
  sessions_all_time: number
  images_processed_all_time: number
  most_used_feature: FeatureName | null
}

export interface NotifyPayload {
  event: 'session' | 'login' | 'flag_change' | 'hf_failure' | 'daily_summary'
  data: Record<string, unknown>
}
