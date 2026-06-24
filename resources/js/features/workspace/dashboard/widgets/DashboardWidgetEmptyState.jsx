import EmptyState from '@/components/ui/EmptyState';

export default function DashboardWidgetEmptyState({
    title = 'Belum ada data',
    description = 'Data widget akan muncul setelah tersedia.',
    className = 'min-h-[228px]',
}) {
    return (
        <EmptyState
            title={title}
            description={description}
            iconName="document"
            size="sm"
            tone="subtle"
            fill
            className={`${className} rounded-[4px] bg-transparent px-0 py-0`.trim()}
            titleClassName="text-base font-medium text-text-muted md:text-base"
            descriptionClassName="mt-2 text-xs leading-5 text-text-light md:text-sm"
        />
    );
}
