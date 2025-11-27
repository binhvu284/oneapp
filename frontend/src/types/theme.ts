// Theme system types

export interface ThemeColors {
  // Background Colors
  bg: string
  panel: string
  bgSecondary: string
  bgHover: string

  // Text Colors
  text: string
  textPrimary: string
  textSecondary: string
  muted: string

  // Primary Colors
  primary: string
  primaryDark: string
  primaryLight: string

  // Semantic Colors
  success: string
  successLight: string
  danger: string
  dangerDark: string
  dangerLight: string
  warning: string
  warningLight: string
  info: string
  infoLight: string

  // Borders & Dividers
  border: string
  borderLight: string

  // Component-specific colors
  sidebarBg: string
  sidebarText: string
  sidebarActive: string
  sidebarIcon: string
  sidebarBorder: string
  headerBg: string
  headerText: string
  headerTitleText: string
  headerTitleIcon: string
  headerAvatarBg: string
  headerUserName: string
  headerBorder: string
  contentBg: string
  contentText: string
  contentTextSecondary: string
  contentButton: string
}

export interface CustomTheme extends ThemeTemplate {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  useAutoSidebar: boolean
  useAutoHeader: boolean
  useAutoContent: boolean
}

export interface ThemeTemplate {
  id: string
  name: string
  description: string
  colors: ThemeColors
}

export type ThemeMode = 'light' | 'dark' | 'custom'

