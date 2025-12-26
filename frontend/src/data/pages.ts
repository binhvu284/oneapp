// Centralized data structure for all pages/applications in the system
// This can be used by Library, Sidebar Configuration, Header Configuration, etc.

export type AppStatus = 'Available' | 'Unavailable' | 'Coming soon'
export type AppType = 'In use app' | 'Integrated' | 'Third party' | 'Open source' | 'Custom'
export type AppManagementStatus = 'active' | 'inactive'
export type AppTypeCategory = 'OneApp System' | 'Convenience Tool'

export interface PageInfo {
  id: string
  path: string
  name: string
  description: string
  icon: string // Icon component name
  category: string
  tags: string[]
  enabled: boolean
  featured?: boolean
  status: AppStatus
  appType: AppType
  // Management fields
  createDate?: string // ISO date string
  developer?: string // User/author name
  publishDate?: string // ISO date string
  managementStatus?: AppManagementStatus // active/inactive for management
  // Detail page fields
  image?: string // App image URL
  publisher?: string // Publisher name
  appSize?: string // App size (e.g., "2.5 MB")
  sourceCodeUrl?: string // Source code repository URL
  // Library organization
  appTypeCategory?: AppTypeCategory // OneApp System or Convenience Tool
  homeSection?: string // Section name for Home page (e.g., "OneApp Core", "Sidebar app", "Header App", "Convenience Tool", "Coming soon App", "UI/UX app")
}

export const allPages: PageInfo[] = [
  {
    id: 'dashboard',
    path: '/',
    name: 'Dashboard',
    description: 'Overview of your workspace and quick access to key features',
    icon: 'IconDashboard',
    category: 'Core',
    tags: ['overview', 'home', 'main'],
    enabled: true,
    featured: true,
    status: 'Available',
    appType: 'In use app',
    createDate: '2024-01-15T00:00:00Z',
    developer: 'System',
    publishDate: '2024-01-15T00:00:00Z',
    managementStatus: 'active',
    publisher: 'OneApp',
    appSize: '2.1 MB',
    appTypeCategory: 'OneApp System',
    homeSection: 'OneApp Core',
  },
  {
    id: 'ai',
    path: '/ai',
    name: 'OneApp AI',
    description: 'Get help and answers from the AI assistant',
    icon: 'IconAI',
    category: 'Core',
    tags: ['ai', 'assistant', 'help', 'chat'],
    enabled: true,
    featured: true,
    status: 'Available',
    appType: 'In use app',
    createDate: '2024-03-01T00:00:00Z',
    developer: 'OneApp Team',
    publishDate: '2024-03-15T00:00:00Z',
    managementStatus: 'active',
    publisher: 'OneApp',
    appSize: '3.5 MB',
    appTypeCategory: 'OneApp System',
    homeSection: 'OneApp Core',
  },
  {
    id: 'interface',
    path: '/customization/interface',
    name: 'Interface',
    description: 'Customize theme, layout, display, and navigation settings',
    icon: 'IconInterface',
    category: 'Customization',
    tags: ['theme', 'layout', 'customization'],
    enabled: true,
    status: 'Available',
    appType: 'Custom',
    createDate: '2024-02-15T00:00:00Z',
    developer: 'Design Team',
    publishDate: '2024-02-20T00:00:00Z',
    managementStatus: 'active',
    appTypeCategory: 'OneApp System',
    homeSection: 'UI/UX app',
  },
  {
    id: 'system-admin',
    path: '/customization/system-admin',
    name: 'System Admin',
    description: 'System administration and configuration options',
    icon: 'IconSystemAdmin',
    category: 'System',
    tags: ['admin', 'system', 'configuration'],
    enabled: true,
    status: 'Available',
    appType: 'In use app',
    createDate: '2024-01-05T00:00:00Z',
    developer: 'System',
    publishDate: '2024-01-05T00:00:00Z',
    managementStatus: 'active',
    publisher: 'OneApp',
    appSize: '1.2 MB',
    appTypeCategory: 'OneApp System',
    homeSection: 'OneApp Core',
  },
  {
    id: 'onlyapi',
    path: '/onlyapi',
    name: 'OnlyAPI',
    description: 'Connect and check APIs from other applications through API integration. Test REST and GraphQL endpoints, manage API connections, and monitor API health.',
    icon: 'IconAPI',
    category: 'Core',
    tags: ['api', 'integration', 'connect', 'rest', 'graphql', 'testing'],
    enabled: true,
    status: 'Available',
    appType: 'Integrated',
    createDate: '2024-03-20T00:00:00Z',
    developer: 'OneApp Team',
    publishDate: '2024-03-25T00:00:00Z',
    managementStatus: 'active',
    publisher: 'OneApp',
    appSize: '850 KB',
    sourceCodeUrl: 'https://github.com/oneapp/onlyapi',
    appTypeCategory: 'OneApp System',
    homeSection: 'OneApp Core',
  },
  {
    id: 'prochess',
    path: '/prochess',
    name: 'ProChess',
    description: 'Professional chess game with advanced AI opponents, puzzle solving, and tournament modes',
    icon: 'IconChess',
    category: 'Tools',
    tags: ['chess', 'game', 'puzzle', 'ai', 'tournament'],
    enabled: false,
    status: 'Coming soon',
    appType: 'Third party',
    createDate: '2024-04-01T00:00:00Z',
    developer: 'Game Studio',
    publishDate: '2024-06-01T00:00:00Z',
    managementStatus: 'active',
    publisher: 'Game Studio',
    appSize: '5.2 MB',
    appTypeCategory: 'Convenience Tool',
    homeSection: 'Coming soon App',
  },
  {
    id: 'safebase',
    path: '/safebase',
    name: 'Safebase',
    description: 'Secure password management and encryption tool for storing and managing your credentials safely',
    icon: 'IconShield',
    category: 'Tools',
    tags: ['security', 'password', 'encryption', 'vault', 'privacy'],
    enabled: false,
    status: 'Coming soon',
    appType: 'Integrated',
    createDate: '2024-04-05T00:00:00Z',
    developer: 'Security Team',
    publishDate: '2024-05-15T00:00:00Z',
    managementStatus: 'active',
    publisher: 'OneApp',
    appSize: '2.8 MB',
    appTypeCategory: 'Convenience Tool',
    homeSection: 'Coming soon App',
  },
  {
    id: 'easymanage',
    path: '/easymanage',
    name: 'Easy Manage',
    description: 'Simple project and task management tool with intuitive interface for organizing your work',
    icon: 'IconBriefcase',
    category: 'Tools',
    tags: ['project', 'task', 'management', 'productivity', 'organization'],
    enabled: false,
    status: 'Coming soon',
    appType: 'Custom',
    createDate: '2024-04-10T00:00:00Z',
    developer: 'Productivity Team',
    publishDate: '2024-05-20T00:00:00Z',
    managementStatus: 'active',
    publisher: 'OneApp',
    appSize: '1.5 MB',
    appTypeCategory: 'Convenience Tool',
    homeSection: 'Coming soon App',
  },
  {
    id: 'oneapp-developer',
    path: '/oneapp-developer',
    name: 'OneApp Developer',
    description: 'Manage and configure applications that appear in the library. Create, edit, and organize apps for the OneApp ecosystem.',
    icon: 'IconDeveloper',
    category: 'Core',
    tags: ['developer', 'management', 'apps', 'library', 'configuration'],
    enabled: true,
    featured: true,
    status: 'Available',
    appType: 'In use app',
    createDate: '2024-01-10T00:00:00Z',
    developer: 'OneApp Team',
    publishDate: '2024-01-10T00:00:00Z',
    managementStatus: 'active',
    publisher: 'OneApp',
    appSize: '2.5 MB',
    appTypeCategory: 'OneApp System',
    homeSection: 'OneApp Core',
  },
  {
    id: 'oneapp-data',
    path: '/oneapp-data',
    name: 'OneApp Data',
    description: 'Manage data types, data structures, and database schemas. Understand how data is stored and organized in OneApp.',
    icon: 'IconDatabase',
    category: 'Core',
    tags: ['data', 'database', 'schema', 'structure', 'management'],
    enabled: true,
    featured: true,
    status: 'Available',
    appType: 'In use app',
    createDate: '2024-01-10T00:00:00Z',
    developer: 'OneApp Team',
    publishDate: '2024-01-10T00:00:00Z',
    managementStatus: 'active',
    publisher: 'OneApp',
    appSize: '3.2 MB',
    appTypeCategory: 'OneApp System',
    homeSection: 'OneApp Core',
  },
]

export const categories = ['All', 'Core', 'Tools', 'System', 'Customization']

export function getPageById(id: string): PageInfo | undefined {
  return allPages.find((page) => page.id === id)
}

export function getPagesByCategory(category: string): PageInfo[] {
  if (category === 'All') return allPages
  return allPages.filter((page) => page.category === category)
}

export function searchPages(query: string): PageInfo[] {
  const lowerQuery = query.toLowerCase()
  return allPages.filter(
    (page) =>
      page.name.toLowerCase().includes(lowerQuery) ||
      page.description.toLowerCase().includes(lowerQuery) ||
      page.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

