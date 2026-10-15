import type { LucideIcon, LucideProps } from 'lucide-react';
import {
  Home as IconHome,
  Plus as IconPlus,
  User as IconUser,
  Wind as IconWind,
  Droplets as IconDroplets,
  Zap as IconZap,
  Plug as IconPlug,
  Wrench as IconWrench,
  Bell as IconBell,
  ChevronRight as IconChevronRight,
  ChevronLeft as IconChevronLeft,
  ChevronDown as IconChevronDown,
  ArrowLeft as IconArrowLeft,
  ArrowRight as IconArrowRight,
  ArrowUpRight as IconArrowUpRight,
  X as IconX,
  Check as IconCheck,
  CheckCircle2 as IconCheckCircle,
  AlertTriangle as IconAlert,
  Info as IconInfo,
  Search as IconSearch,
  Settings as IconSettings,
  Trash2 as IconTrash,
  Pencil as IconPencil,
  ShieldCheck as IconShieldCheck,
  Users as IconUsers,
  FileText as IconFileText,
  TrendingUp as IconTrendingUp,
  Compass as IconCompass,
  BookOpen as IconBookOpen,
  Sparkles as IconSparkles,
  LogOut as IconLogOut,
  Smartphone as IconSmartphone,
  Laptop as IconLaptop,
  Calendar as IconCalendar,
  Clock as IconClock,
  MapPin as IconMapPin,
  Camera as IconCamera,
  Download as IconDownload,
  Upload as IconUpload,
  Mail as IconMail,
  Lock as IconLock,
  Eye as IconEye,
  EyeOff as IconEyeOff,
  Loader as IconLoader,
  Circle as IconCircle,
  Flame as IconFlame,
} from 'lucide-react';
import type { ApplianceCategory, HelpLevel } from './types';

/* ------------------------------------------------------------------
 * Icon registry — every named icon used in Hearth.
 * Consistent stroke weight across the entire app.
 * ---------------------------------------------------------------- */
export const ICONS = {
  home: IconHome,
  add: IconPlus,
  profile: IconUser,
  bell: IconBell,
  chevronRight: IconChevronRight,
  chevronLeft: IconChevronLeft,
  chevronDown: IconChevronDown,
  back: IconArrowLeft,
  arrowRight: IconArrowRight,
  arrowUpRight: IconArrowUpRight,
  close: IconX,
  check: IconCheck,
  checkCircle: IconCheckCircle,
  alert: IconAlert,
  info: IconInfo,
  search: IconSearch,
  settings: IconSettings,
  trash: IconTrash,
  edit: IconPencil,
  warranty: IconShieldCheck,
  household: IconUsers,
  documents: IconFileText,
  value: IconTrendingUp,
  compass: IconCompass,
  book: IconBookOpen,
  sparkles: IconSparkles,
  signOut: IconLogOut,
  phone: IconSmartphone,
  desktop: IconLaptop,
  calendar: IconCalendar,
  clock: IconClock,
  pin: IconMapPin,
  camera: IconCamera,
  download: IconDownload,
  upload: IconUpload,
  mail: IconMail,
  lock: IconLock,
  eye: IconEye,
  eyeOff: IconEyeOff,
  loader: IconLoader,
  circle: IconCircle,
  flame: IconFlame,
  // category aliases — so tasks/rows can use a single named icon
  hvac: IconWind,
  plumbing: IconDroplets,
  electrical: IconZap,
  appliance: IconPlug,
  wrench: IconWrench,
} as const;

export type IconName = keyof typeof ICONS;

/* ------------------------------------------------------------------
 * Appliance category → IconName
 * ---------------------------------------------------------------- */
export const CATEGORY_ICON_NAMES: Record<ApplianceCategory, IconName> = {
  hvac: 'hvac',
  plumbing: 'plumbing',
  electrical: 'electrical',
  appliance: 'appliance',
  other: 'wrench',
};

/* ------------------------------------------------------------------
 * Appliance category → Lucide component (for direct render)
 * ---------------------------------------------------------------- */
export const CATEGORY_ICONS: Record<ApplianceCategory, LucideIcon> = {
  hvac: IconWind,
  plumbing: IconDroplets,
  electrical: IconZap,
  appliance: IconPlug,
  other: IconWrench,
};

/* ------------------------------------------------------------------
 * Help level → IconName
 * ---------------------------------------------------------------- */
export const HELP_LEVEL_ICON_NAMES: Record<HelpLevel, IconName> = {
  basic: 'add',
  guided: 'compass',
  detailed: 'book',
};

/* ------------------------------------------------------------------
 * Notification severity → IconName
 * ---------------------------------------------------------------- */
export const SEVERITY_ICON_NAMES: Record<
  'error' | 'warning' | 'info',
  IconName
> = {
  error: 'alert',
  warning: 'bell',
  info: 'info',
};

/* ------------------------------------------------------------------
 * <Icon /> — dynamic named icon
 * ---------------------------------------------------------------- */
type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
} & Omit<LucideProps, 'size' | 'strokeWidth' | 'name'>;

export function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  ...rest
}: IconProps) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp size={size} strokeWidth={strokeWidth} {...rest} />;
}

export default Icon;