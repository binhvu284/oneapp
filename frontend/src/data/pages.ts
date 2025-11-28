// Centralized data structure for all pages/applications in the system
// This can be used by Library, Sidebar Configuration, Header Configuration, etc.

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
  },
  {
    id: 'search',
    path: '/search',
    name: 'Search',
    description: 'Search across all content and pages in the application',
    icon: 'IconSearch',
    category: 'Core',
    tags: ['search', 'find', 'discover'],
    enabled: false,
  },
  {
    id: 'notifications',
    path: '/notifications',
    name: 'Notifications',
    description: 'View and manage your notifications and alerts',
    icon: 'IconBell',
    category: 'Core',
    tags: ['alerts', 'updates', 'messages'],
    enabled: false,
  },
  {
    id: 'ai',
    path: '/ai',
    name: 'AI Assistant',
    description: 'Get help and answers from the AI assistant',
    icon: 'IconAI',
    category: 'Tools',
    tags: ['ai', 'assistant', 'help', 'chat'],
    enabled: true,
    featured: true,
  },
  {
    id: 'modules',
    path: '/modules',
    name: 'Modules',
    description: 'Browse and manage available modules and extensions',
    icon: 'IconModules',
    category: 'Tools',
    tags: ['modules', 'extensions', 'plugins'],
    enabled: true,
  },
  {
    id: 'settings',
    path: '/settings',
    name: 'Settings',
    description: 'Manage your account settings and preferences',
    icon: 'IconSettings',
    category: 'System',
    tags: ['preferences', 'account', 'configuration'],
    enabled: true,
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

