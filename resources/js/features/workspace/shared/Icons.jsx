import {
    Bell,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
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
    RotateCw,
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
import SquareArrowOutUpRight from '@/components/shared/SquareArrowOutUpRight';

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

export function CloseIcon({ className = 'h-4 w-4', strokeWidth = 2.8 }) {
    return <AppIcon icon={X} className={className} strokeWidth={strokeWidth} />;
}

export function RefreshIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={RotateCw} className={className} />;
}

export const RotateCwIcon = RefreshIcon;

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

export function ExportIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={SquareArrowOutUpRight} className={className} />;
}

export { SquareArrowOutUpRight };

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

export function ChevronDownIcon({ className = 'h-4 w-4', strokeWidth = 1.9 }) {
    return <AppIcon icon={ChevronDown} className={`shrink-0 ${className}`.trim()} strokeWidth={strokeWidth} />;
}

export function SortIcon({ className = 'h-3 w-3 text-white/55' }) {
    void className;
    return null;
}

export function TableActionIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Rows3} className={className} />;
}

export function CalcIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={Calculator} className={className} />;
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

export function AlertTriangleFilledIcon({ className = 'h-5 w-5 text-current' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            />
        </svg>
    );
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

export function ChevronLeftIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={ChevronLeft} className={className} strokeWidth={2.2} />;
}

export function ChevronRightIcon({ className = 'h-4 w-4' }) {
    return <AppIcon icon={ChevronRight} className={className} strokeWidth={2.2} />;
}

export function InfoFilledIcon({ className = 'h-4 w-4 text-current' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
            />
        </svg>
    );
}

export function PencilFilledIcon({ className = 'h-4 w-4 text-current' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
    );
}

export function TableFilledIcon({ className = 'h-4 w-4 text-current' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H4zm0 4.5h16V5H4v2.5zm0 2.5v3h7v-3H4zm9 0v3h7v-3h-7zm7 5h-7v4h7v-4zm-9 4v-4H4v4h7z"
            />
        </svg>
    );
}

export function CircleCheckFilledIcon({ className = 'h-4 w-4 text-current' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.25 14.5l-4.25-4.25 1.41-1.41 2.84 2.83 6.84-6.83 1.41 1.41-8.25 8.25z"
            />
        </svg>
    );
}

export function HelpCircleFilledIcon({ className = 'h-4 w-4 text-current' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"
            />
        </svg>
    );
}
