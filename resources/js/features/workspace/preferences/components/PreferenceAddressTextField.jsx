import TextInput from '@/components/ui/TextInput';
import { CloseIcon } from '@/features/workspace/shared/Icons';

export default function PreferenceAddressTextField({ field, value, onChange, className = '', readOnly = false }) {
    return (
        <TextInput
            id={field.id}
            value={value ?? field.value}
            onChange={(e) => onChange?.(field.id, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={readOnly}
            error={field.error}
            message={field.message}
            prefix={field.label}
            prefixClassName="min-w-[62px] border-ui-border-medium px-3 text-xs sm:text-sm text-blue-7c839b"
            trailing={
                field.clearable && !readOnly && Boolean(value ?? field.value) ? (
                    <button
                        type="button"
                        onClick={() => onChange?.(field.id, '')}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors"
                        aria-label="Hapus"
                    >
                        <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                ) : null
            }
            trailingClassName="px-2.5 text-text-trailing-label"
            className={`h-[34px] rounded-[3px] border-ui-border-medium shadow-inset-light ${
                readOnly ? 'bg-ui-bg-panel-lighter' : ''
            } ${className}`.trim()}
            inputClassName={`text-xs sm:text-sm text-brand-dark ${readOnly ? 'text-text-readonly-input' : ''}`}
        />
    );
}
