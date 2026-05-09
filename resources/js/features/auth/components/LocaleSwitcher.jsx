import Button from '@/components/ui/Button';
import FlagIcon from '@/components/shared/FlagIcon';

export default function LocaleSwitcher({ label, flag }) {
    return (
        <Button type="button" variant="secondary" size="md" className="px-3 py-2">
            <FlagIcon code={flag} />
            <span>{label}</span>
            <span className="inline-block h-2.5 w-2.5 rotate-45 border-b border-r border-slate-500" />
        </Button>
    );
}
