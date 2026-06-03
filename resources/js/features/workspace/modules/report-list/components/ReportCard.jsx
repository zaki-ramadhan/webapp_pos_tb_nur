import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { getIconStyles } from '../utils/reportHelpers';

export default function ReportCard({ report, onClick }) {
    const styles = getIconStyles(report.icon);
    
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex w-full items-start gap-4 rounded-[10px] p-2.5 text-left transition hover:bg-[#f9fafb]"
        >
            <NavigationIcon 
                type={styles.icon} 
                className={`h-[28px] w-[28px] shrink-0 mt-0.5 ${styles.color}`} 
                strokeWidth={1.8} 
            />

            <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-medium leading-6 text-[#111827] group-hover:text-[#ef3968] transition-colors">
                    {report.title}
                </span>
                <span className="mt-1 block text-sm leading-5 text-[#64748b]">
                    {report.description}
                </span>
            </span>
        </button>
    );
}
