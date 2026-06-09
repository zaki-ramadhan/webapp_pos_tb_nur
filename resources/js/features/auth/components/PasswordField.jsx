import { useId, useState } from 'react';

import FormField from '@/components/ui/FormField';
import TextInput from '@/components/ui/TextInput';

function EyeIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="3.1" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.7a3 3 0 0 0 4.2 4.2" />
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.3 0 9.3 5.4 9.5 5.6a.7.7 0 0 1 0 .8 18.4 18.4 0 0 1-4.2 4.2" />
            <path d="M6.2 6.3A18.3 18.3 0 0 0 2.5 10.6a.7.7 0 0 0 0 .8C2.7 11.6 6.7 17 12 17c1 0 2-.2 2.9-.5" />
        </svg>
    );
}

export default function PasswordField({
    id,
    label,
    value,
    onChange,
    placeholder = '',
    error = '',
    className = '',
    required = false,
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const toggleLabel = showPassword ? 'Sembunyikan password' : 'Tampilkan password';

    return (
        <FormField label={label} htmlFor={inputId} className={className} required={required}>
            <TextInput
                id={inputId}
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                error={error}
                trailing={
                    <button
                        type="button"
                        aria-label={toggleLabel}
                        aria-pressed={showPassword}
                        title={toggleLabel}
                        onClick={() => setShowPassword((value) => !value)}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                    >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                }
                {...props}
            />
        </FormField>
    );
}
