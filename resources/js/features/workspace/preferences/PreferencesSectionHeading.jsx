import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';

export default function PreferencesSectionHeading({ icon, title }) {
    return (
        <div className="border-b border-[#d7dde8] pb-2">
            <div className="flex items-center gap-2.5 text-[#0568eb]">
                <NavigationIcon
                    type={icon}
                    className="h-6 w-6 shrink-0 text-current sm:h-7 sm:w-7"
                />
                <h3 className="text-[16px] font-normal tracking-[-0.01em] sm:text-[17px] md:text-[18px]">
                    {title}
                </h3>
            </div>
        </div>
    );
}
