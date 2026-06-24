import Panel from '@/components/ui/Panel';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';

const toneClasses = {
    amber: 'bg-panel text-orange-de6f13',
    blue: 'bg-action-btn-active-bg text-blue-1472b6',
    green: 'bg-green-ddf7d2 text-green-5b920f',
    purple: 'bg-purple-ecddff text-purple-681db1',
};

export default function ModulePageView({ page }) {
    const placeholder = page.placeholder ?? {};
    const toneClass = toneClasses[page.tone] ?? toneClasses.blue;

    return (
        <div className="flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <div className="relative z-10 -mb-px inline-flex h-[34px] max-w-full items-center rounded-t-[5px] border-x border-t-[2px] border-b-0 border-l-border-tab-secondary border-r-border-tab-secondary border-t-tab-active-border-t bg-white px-3 text-sm font-medium text-section-tab-accent-text sm:px-3.5 sm:text-base md:text-base">
                    {page.label}
                </div>
            </div>

            <Panel className="flex min-h-[320px] flex-1 flex-col justify-center rounded-[4px] border border-ui-border bg-white px-4 py-6 shadow-card-light sm:min-h-[340px] sm:px-6 sm:py-8">
                <div className="mx-auto flex max-w-[560px] flex-col items-center text-center">
                    <span className={`inline-flex h-20 w-20 items-center justify-center rounded-[22px] sm:h-24 sm:w-24 sm:rounded-[26px] ${toneClass}`.trim()}>
                        <NavigationIcon type={page.icon} className="h-10 w-10 sm:h-12 sm:w-12" />
                    </span>

                    <p className="mt-6 text-xs font-semibold text-text-light">
                        {page.moduleLabel}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-brand-darker sm:text-2xl md:text-2xl xl:text-3xl 2xl:text-3xl">{page.label}</h2>
                    <p className="mt-3 text-sm leading-6 text-text-muted md:text-base">
                        {placeholder.description ??
                            `Halaman ${page.label} sudah bisa dibuka sebagai stack tab dari menu ${page.moduleLabel}.`}
                    </p>

                    <div className="mt-6 inline-flex items-center rounded-full bg-brand-blue-lightest px-4 py-2 text-sm text-tab-primary-inactive-text">
                        Struktur halaman ini sudah terhubung ke navigasi sidebar dan siap diisi form atau tabel berikutnya.
                    </div>
                </div>
            </Panel>
        </div>
    );
}
