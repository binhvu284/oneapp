// Utility to get icon components by name
import {
  IconDashboard,
  IconAI,
  IconModules,
  IconSettings,
  IconSearch,
  IconBell,
  IconInterface,
  IconSystemAdmin,
  IconTheme,
  IconLayout,
  IconDisplay,
  IconNavigation,
  IconUser,
  IconLogout,
} from '@/components/Icons'

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  IconDashboard,
  IconAI,
  IconModules,
  IconSettings,
  IconSearch,
  IconBell,
  IconInterface,
  IconSystemAdmin,
  IconTheme,
  IconLayout,
  IconDisplay,
  IconNavigation,
  IconUser,
  IconLogout,
}

export function getIcon(iconName: string): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  if (!iconName) return IconDashboard
  return iconMap[iconName] || IconDashboard
}

