import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import { TransactionFieldLabel } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { CloseIcon } from '@/features/workspace/shared/Icons';

export function WarehouseFieldRow({ label, required = false, children, className = '' }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
            <TransactionFieldLabel label={label} required={required} className="pt-2 leading-6" />
            <div>{children}</div>
        </div>
    );
}

export function ClearableTextInput({ id, name, value, onChange, placeholder = '', className = '', inputClassName = '', ...props }) {
    return (
        <TextInput
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`h-[40px] rounded-[4px] border-ui-border ${className}`.trim()}
            inputClassName={`text-xs sm:text-sm text-brand-dark ${inputClassName}`.trim()}
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-text-darkest transition hover:bg-bg-workspace-light"
                        aria-label="Kosongkan isian"
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null
            }
            trailingClassName={value ? 'pr-2' : ''}
            {...props}
        />
    );
}

export function PrefixedTextArea({ prefix, value, onChange }) {
    return (
        <div className="flex overflow-hidden rounded-[4px] border border-slate-400 bg-white">
            <div className="flex min-w-[92px] items-start justify-start border-r border-slate-400 bg-input-prefix-bg px-3 py-3 text-xs sm:text-sm text-input-prefix-text">
                {prefix}
            </div>
            <TextareaField
                value={value}
                onChange={onChange}
                rows={4}
                className="border-none"
                textareaClassName="min-h-[112px] text-brand-dark"
            />
        </div>
    );
}

export function PrefixedInput({ prefix, value, onChange, className = '', prefixClassName = '', ...props }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            prefix={prefix}
            className={`h-[40px] rounded-[4px] border-slate-400 ${className}`.trim()}
            prefixClassName={prefixClassName || "min-w-[92px] border-slate-400 bg-input-prefix-bg px-3 text-xs sm:text-sm text-input-prefix-text"}
            inputClassName="text-xs sm:text-sm text-brand-dark"
            {...props}
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-text-darkest transition hover:bg-bg-workspace-light"
                        aria-label={`Kosongkan ${prefix}`}
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null
            }
            trailingClassName={value ? 'pr-2' : ''}
        />
    );
}
