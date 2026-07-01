import {
    Bell,
    CalendarDays,
    ChevronDown,
    CircleCheck,
    CircleX,
    Columns3,
    Download,
    EllipsisVertical,
    ExternalLink,
    FileText,
    Funnel,
    Info,
    Link2,
    LogOut,
    Lightbulb,
    List,
    MapPin,
    Paperclip,
    Pencil,
    Plus,
    Printer,
    Loader2,
    RefreshCw,
    Rows3,
    Save,
    Search,
    Settings,
    Share,
    Shield,
    TriangleAlert,
    Trash2,
    Upload,
    ArrowRightLeft,
    Calculator,
    X,
} from 'lucide-react';

function AppIcon({ icon: Icon, className, strokeWidth = 1.9 }) {
    return <Icon aria-hidden="true" className={className} strokeWidth={strokeWidth} absoluteStrokeWidth />;
}

export function SearchIcon({ className = 'h-5 w-5 text-text-light' }) {
    return <AppIcon icon={Search} className={className} />;
}

export function PlusIcon({ className = 'h-5 w-5', strokeWidth = 2.8 }) {
    return <AppIcon icon={Plus} className={className} strokeWidth={strokeWidth} />;
}

export function KebabIcon({ className = 'h-5 w-5 text-layout-text' }) {
    return <AppIcon icon={EllipsisVertical} className={className} />;
}

export function CogIcon({ className = 'h-5 w-5 text-current' }) {
    return <AppIcon icon={Settings} className={className} />;
}

export function CloseIcon({ className = 'h-4 w-4', strokeWidth = 1.9 }) {
    return <AppIcon icon={X} className={className} strokeWidth={strokeWidth} />;
}

export function RefreshIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={RefreshCw} className={className} />;
}

export function LoadingIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Loader2} className={className} />;
}

export function CalendarIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={CalendarDays} className={className} />;
}

export function PencilIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Pencil} className={className} />;
}

export function LinkIcon({ className = 'h-5 w-5' }) {
    return <AppIcon icon={Link2} className={className} />;
}

export function PrintIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Printer} className={className} />;
}

export function DownloadIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Download} className={className} />;
}

export function ShareIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Share} className={className} />;
}

export function FileIcon({ className = 'h-4.5 w-4.5' }) {
    return <AppIcon icon={FileText} className={className} />;
}

export function UploadIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Upload} className={className} />;
}

export function ColumnsIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Columns3} className={className} />;
}

export function ExternalLinkIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={ExternalLink} className={className} />;
}

export function FunnelIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Funnel} className={className} />;
}

export function PaperclipIcon({ className = 'h-5 w-5' }) {
    return <AppIcon icon={Paperclip} className={className} />;
}

export function SaveIcon({ className = 'h-7 w-7' }) {
    return <AppIcon icon={Save} className={className} />;
}

export function TrashIcon({ className = 'h-7 w-7' }) {
    return <AppIcon icon={Trash2} className={className} />;
}

export function ChevronDownIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={ChevronDown} className={`shrink-0 ${className}`.trim()} />;
}

export function SortIcon({ className = 'h-3 w-3 text-white/55' }) {
    void className;
    return null;
}

export function TableActionIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Rows3} className={className} />;
}

export function CrossStatusIcon({ className = 'h-5 w-5 text-red-700' }) {
    return <AppIcon icon={CircleX} className={className} />;
}

export function CircleCheckIcon({ className = 'h-5 w-5 text-current' }) {
    return <AppIcon icon={CircleCheck} className={className} />;
}

export function ShieldIcon({ className = 'h-5 w-5 text-text-light' }) {
    return <AppIcon icon={Shield} className={className} />;
}

export function PinIcon({ className = 'h-[18px] w-[18px] text-text-light' }) {
    return <AppIcon icon={MapPin} className={className} />;
}

export function InfoIcon({ className = 'h-5 w-5 text-layout-text' }) {
    return <AppIcon icon={Info} className={className} />;
}

export function IdeaIcon({ className = 'h-5 w-5 text-current' }) {
    return <AppIcon icon={Lightbulb} className={className} />;
}

export function ViewModeIcon({ className = 'h-4.5 w-4.5' }) {
    return <AppIcon icon={List} className={className} strokeWidth={2.1} />;
}

export function AlertTriangleIcon({ className = 'h-5 w-5 text-red-900' }) {
    return <AppIcon icon={TriangleAlert} className={className} />;
}

export function BellIcon({ className = 'h-6.5 w-6.5' }) {
    return <AppIcon icon={Bell} className={className} />;
}

export function LogoutIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={LogOut} className={className} />;
}

export function ArrowRightLeftIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={ArrowRightLeft} className={className} />;
}

export function CalculatorIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Calculator} className={className} />;
}
