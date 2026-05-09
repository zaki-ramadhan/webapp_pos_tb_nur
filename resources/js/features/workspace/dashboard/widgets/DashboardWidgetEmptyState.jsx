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
            titleClassName="text-[15px] font-medium text-[#6b738f] md:text-[16px]"
            descriptionClassName="mt-2 text-[12px] leading-5 text-[#8a91a8] md:text-[13px]"
        />
    );
}
