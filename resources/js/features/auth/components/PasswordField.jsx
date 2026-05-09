import { useId, useState } from 'react';

import FormField from '@/components/ui/FormField';
import TextInput from '@/components/ui/TextInput';

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
    className = '',
}) {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <FormField label={label} htmlFor={inputId} className={className}>
            <TextInput
                id={inputId}
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                trailing={
                    <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword((value) => !value)}
                    >
                        <EyeOffIcon />
                    </button>
                }
            />
        </FormField>
    );
}
