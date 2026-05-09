import Panel from '@/components/ui/Panel';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';

const toneClasses = {
    amber: 'bg-[#ffeddc] text-[#de6f13]',
    blue: 'bg-[#dcedff] text-[#1472b6]',
    green: 'bg-[#ddf7d2] text-[#5d930f]',
    purple: 'bg-[#ecddff] text-[#681db1]',
};

export default function ModulePageView({ page }) {
    const placeholder = page.placeholder ?? {};
    const toneClass = toneClasses[page.tone] ?? toneClasses.blue;

    return (
        <div className="flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <div className="relative z-10 -mb-px inline-flex h-[34px] max-w-full items-center rounded-t-[5px] border-x border-t-[2px] border-b-0 border-l-[#bcc3cf] border-r-[#bcc3cf] border-t-[#ED3969] bg-white px-3 text-[14px] font-medium text-[#21283b] sm:px-3.5 sm:text-[15px] md:text-[16px]">
                    {page.label}
                </div>
            </div>

            <Panel className="flex min-h-[320px] flex-1 flex-col justify-center rounded-[4px] border border-[#cfd6e2] bg-white px-4 py-6 shadow-[0_2px_10px_rgba(15,23,42,0.08)] sm:min-h-[340px] sm:px-6 sm:py-8">
                <div className="mx-auto flex max-w-[560px] flex-col items-center text-center">
                    <span className={`inline-flex h-20 w-20 items-center justify-center rounded-[22px] sm:h-24 sm:w-24 sm:rounded-[26px] ${toneClass}`.trim()}>
                        <NavigationIcon type={page.icon} className="h-10 w-10 sm:h-12 sm:w-12" />
                    </span>

                    <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8a91a8]">
                        {page.moduleLabel}
                    </p>
                    <h2 className="mt-3 text-[20px] font-semibold text-[#1f2536] sm:text-[22px] md:text-[24px] xl:text-[26px] 2xl:text-[28px]">{page.label}</h2>
                    <p className="mt-3 text-[14px] leading-6 text-[#69718d] md:text-[15px]">
                        {placeholder.description ??
                            `Halaman ${page.label} sudah bisa dibuka sebagai stack tab dari menu ${page.moduleLabel}.`}
                    </p>

                    <div className="mt-6 inline-flex items-center rounded-full bg-[#f3f6fb] px-4 py-2 text-[13px] text-[#53607f]">
                        Struktur halaman ini sudah terhubung ke navigasi sidebar dan siap diisi form atau tabel berikutnya.
                    </div>
                </div>
            </Panel>
        </div>
    );
}
