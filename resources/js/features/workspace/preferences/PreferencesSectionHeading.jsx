import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';

export default function PreferencesSectionHeading({ icon, title }) {
    return (
        <div className="border-b border-ui-border-medium pb-2">
            <div className="flex items-center gap-2.5 text-blue-540">
                <NavigationIcon
                    type={icon}
                    className="h-6 w-6 shrink-0 text-current sm:h-7 sm:w-7"
                />
                <h3 className="text-base font-normal tracking-[-0.01em] sm:text-base md:text-lg">
                    {title}
                </h3>
            </div>
        </div>
    );
}
