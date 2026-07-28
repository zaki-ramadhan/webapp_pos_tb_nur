import TextInput from '@/components/ui/TextInput';
import { CloseIcon } from '@/features/workspace/shared/Icons';

export function ItemCategoryFieldRow({ label, required = false, children, className = '' }) {
    return (
        <div className={`grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
            <label className="pt-2 text-xs sm:text-sm leading-6 text-brand-dark">
                {label}
                {required ? <span className="text-tab-active-border-t"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

export function ClearableTextInput({ value, onChange, className = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            className={`h-[40px] rounded-[4px] border-ui-border ${className}`.trim()}
            inputClassName="text-xs sm:text-sm text-brand-dark"
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-text-darkest transition hover:bg-bg-workspace-light"
                        aria-label="Kosongkan nama kategori"
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null
            }
            trailingClassName={value ? 'pr-2' : ''}
        />
    );
}
