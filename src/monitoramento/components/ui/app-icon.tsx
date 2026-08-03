import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Database,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Gauge,
  History,
  Home,
  Info,
  KeyRound,
  Layers3,
  LineChart,
  LockKeyhole,
  LogOut,
  Menu,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/monitoramento/lib/utils/cn";

const iconMap = {
  about: Info,
  activity: Activity,
  alert: AlertTriangle,
  audit: ShieldCheck,
  back: ArrowLeft,
  calendar: CalendarDays,
  cancel: X,
  chart: BarChart3,
  collapse: PanelLeftClose,
  competencies: ClipboardList,
  coverage: Gauge,
  cras: Home,
  creas: Building2,
  delete: Trash2,
  diagnostics: Activity,
  download: Download,
  edit: Edit3,
  error: XCircle,
  evolution: LineChart,
  executive: LineChart,
  expand: PanelLeftOpen,
  filter: Filter,
  form: FileText,
  forms: FileText,
  forward: ArrowRight,
  group: Layers3,
  groups: Layers3,
  help: CircleHelp,
  hidePassword: EyeOff,
  history: History,
  home: Home,
  indicators: Database,
  info: Info,
  lock: LockKeyhole,
  logout: LogOut,
  menu: Menu,
  monitoring: Gauge,
  more: MoreVertical,
  notifications: Bell,
  observation: BookOpen,
  open: ChevronRight,
  operational: BarChart3,
  pending: CircleDashed,
  permissions: KeyRound,
  profile: UserRound,
  publish: BadgeCheck,
  refresh: RefreshCcw,
  review: ClipboardCheck,
  search: Search,
  security: ShieldCheck,
  send: Send,
  showPassword: Eye,
  specialField: CircleAlert,
  strategicIndicator: LineChart,
  success: CircleCheck,
  time: Clock3,
  unit: Building2,
  units: Building2,
  users: UsersRound,
  view: Eye,
  previous: ChevronLeft,
} satisfies Record<string, LucideIcon>;

const sizes = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-7 w-7",
} as const;

export type AppIconName = keyof typeof iconMap;
export type AppIconSize = keyof typeof sizes;

type AppIconProps = {
  className?: string;
  decorative?: boolean;
  name: AppIconName;
  size?: AppIconSize;
  title?: string;
};

export function AppIcon({
  className,
  decorative = true,
  name,
  size = "md",
  title,
}: AppIconProps) {
  const Icon = iconMap[name];
  const accessibilityProps =
    decorative || !title
      ? ({ "aria-hidden": "true" } as const)
      : ({ "aria-label": title, role: "img" } as const);

  return (
    <Icon
      className={cn("shrink-0 stroke-[1.9]", sizes[size], className)}
      {...accessibilityProps}
    />
  );
}
