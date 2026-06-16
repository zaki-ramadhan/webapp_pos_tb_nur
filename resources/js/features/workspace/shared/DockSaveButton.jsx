import DockActionButton from '@/features/workspace/shared/DockActionButton';
import { SaveIcon } from '@/features/workspace/shared/Icons';

export default function DockSaveButton({ label, disabled = false, onClick, tone }) {
    return (
        <DockActionButton
            label={label}
            icon={<SaveIcon className="h-8 w-8 sm:h-9 sm:w-9" />}
            disabled={disabled}
            onClick={onClick}
            tone={tone}
        />
    );
}
