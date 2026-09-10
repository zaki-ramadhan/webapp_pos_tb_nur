import EmptyState from '@/components/ui/EmptyState';

export default function DashboardWidgetEmptyState({
    title = 'Belum ada data',
    description = 'Data widget akan muncul setelah tersedia.',
    className = 'min-h-[228px]',
}) {
    let resolvedTitle = title;
    let resolvedDescription = description;

    if (title === 'Kegiatan Mendatang') {
        resolvedTitle = 'Belum ada data';
        resolvedDescription = 'Belum ada jadwal kegiatan mendatang.';
    } else if (title === 'Kegiatan Terlewat') {
        resolvedTitle = 'Belum ada data';
        resolvedDescription = 'Belum ada jadwal kegiatan yang lewat jatuh tempo.';
    } else if (typeof description === 'string' && description.includes('Widget ini siap dihubungkan')) {
        resolvedTitle = 'Belum ada data';
        resolvedDescription = 'Data widget akan muncul setelah tersedia.';
    }

    return (
        <EmptyState
            title={resolvedTitle}
            description={resolvedDescription}
            iconName="document"
            size="sm"
            tone="subtle"
            fill
            className={`${className} rounded-[4px] bg-transparent px-0 py-0`.trim()}
            titleClassName="text-sm lg:text-base font-normal text-text-muted"
            descriptionClassName="mt-0.5 text-xs lg:text-sm leading-5 text-text-light"
        />
    );
}
