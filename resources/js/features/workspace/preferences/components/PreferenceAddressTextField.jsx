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
            prefixClassName="min-w-[62px] border-[#d8dde7] px-3 text-[14px] md:text-[15px] text-[#7b8597]"
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
            trailingClassName="px-2.5 text-[#1f2d42]"
            className={`h-[34px] rounded-[3px] border-[#d8dde7] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ${
                readOnly ? 'bg-[#f8f8f8]' : ''
            } ${className}`.trim()}
            inputClassName={`text-[14px] md:text-[15px] text-[#1f2436] ${readOnly ? 'text-[#6a7388]' : ''}`}
        />
    );
}
