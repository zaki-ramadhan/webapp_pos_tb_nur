import { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';

import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import TextInput from '@/components/ui/TextInput';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import { ChevronDown } from 'lucide-react';
import { dismissToast, showErrorToast, showLoadingToast } from '@/components/feedback/toast';
import { applyClientErrors, getAuthFormMessage, getFirstInlineError, validateRegisterForm } from '@/features/auth/authFormFeedback';
import AuthFooterPrompt from '@/features/auth/components/AuthFooterPrompt';
import AuthHeading from '@/features/auth/components/AuthHeading';
import AuthInput from '@/features/auth/components/AuthInput';
import PasswordField from '@/features/auth/components/PasswordField';

function NameField({ salutation, onSalutationChange, prefixClassName, label, value, onChange, error, placeholder, required = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <FormField label={label} required={required}>
            <TextInput
                className="!overflow-visible"
                prefix={
                    <div className="relative flex h-full w-full items-stretch">
                        <button
                            ref={buttonRef}
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex w-full items-center justify-center gap-1.5 text-input-focus text-xs sm:text-sm font-semibold outline-none cursor-pointer focus:outline-none px-3 h-full"
                        >
                            <span>{salutation}</span>
                            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                        </button>
                        <DropdownMenu
                            open={isOpen}
                            onClose={() => setIsOpen(false)}
                            anchorRef={buttonRef}
                            align="end"
                            side="bottom"
                            widthClassName="w-[85px]"
                        >
                            <DropdownMenuItem onClick={() => { onSalutationChange('Bpk'); setIsOpen(false); }}>
                                Bpk
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { onSalutationChange('Ibu'); setIsOpen(false); }}>
                                Ibu
                            </DropdownMenuItem>
                        </DropdownMenu>
                    </div>
                }
                prefixClassName={prefixClassName}
                value={value}
                onChange={onChange}
                error={error}
                placeholder={placeholder}
            />
        </FormField>
    );
}

export default function RegisterFormPanel({ register }) {
    const [salutation, setSalutation] = useState('Bpk');
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    function submit(event) {
        event.preventDefault();

        const cleanedName = form.data.name.trim().replace(/\s+/g, ' ');
        const cleanedEmail = form.data.email.trim();
        const cleanedPhone = form.data.phone.trim();

        // Perbarui input form
        form.setData(prev => ({
            ...prev,
            name: cleanedName,
            email: cleanedEmail,
            phone: cleanedPhone,
        }));

        const clientErrors = validateRegisterForm({
            name: cleanedName,
            email: cleanedEmail,
            phone: cleanedPhone,
            password: form.data.password,
        }, {
            showPhoneField: register.showPhoneField,
        });

        if (Object.keys(clientErrors).length > 0) {
            applyClientErrors(form, clientErrors);

            return;
        }

        form.clearErrors();

        form.transform((data) => ({
            ...data,
            name: `${salutation}. ${cleanedName}`,
            email: cleanedEmail,
            phone: cleanedPhone,
        }));

        let loadingToastId = null;
        let requestFailed = false;

        form.post('/register', {
            onStart: () => {
                loadingToastId = showLoadingToast({
                    title: 'Memproses',
                    message: 'Sedang menyiapkan akun baru Anda.',
                });
            },
            onError: (errors) => {
                requestFailed = true;

                if (loadingToastId) {
                    dismissToast(loadingToastId);
                }

                showErrorToast({
                    title: 'Pendaftaran gagal',
                    message: getAuthFormMessage(errors) || getFirstInlineError(errors, ['name', 'email', 'phone', 'password']) || 'Periksa kembali data pendaftaran Anda.',
                });
            },
            onFinish: () => {
                if (loadingToastId && !requestFailed) {
                    dismissToast(loadingToastId);
                }
            },
        });
    }

    return (
        <div className="flex min-h-full flex-col px-5 py-5 sm:px-8 sm:py-7 xl:px-10 xl:py-8">
            <div className="mx-auto flex w-full max-w-[442px] flex-1 flex-col justify-center">
                <AuthHeading title={register.title} subtitle={register.subtitle} />

                <form className="mt-6 space-y-3 sm:mt-8" onSubmit={submit}>
                    <NameField
                        salutation={salutation}
                        onSalutationChange={setSalutation}
                        prefixClassName="!px-0 flex items-stretch"
                        label={register.nameLabel}
                        placeholder={register.namePlaceholder}
                        value={form.data.name}
                        onChange={(event) => form.setData('name', event.target.value)}
                        error={form.errors.name}
                        required
                    />
                    <AuthInput
                        label={register.emailLabel}
                        type="email"
                        name="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder={register.emailPlaceholder}
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        error={form.errors.email}
                        required
                    />
                    {register.showPhoneField ? (
                        <AuthInput
                            label={register.phoneLabel}
                            name="phone"
                            autoComplete="tel"
                            placeholder={register.phonePlaceholder}
                            value={form.data.phone}
                            onChange={(event) => form.setData('phone', event.target.value)}
                            error={form.errors.phone}
                        />
                    ) : null}
                    <PasswordField
                        label={register.passwordLabel}
                        name="password"
                        placeholder={register.passwordPlaceholder}
                        autoComplete="new-password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        error={form.errors.password}
                        required
                    />

                    <Button
                        type="submit"
                        fullWidth
                        disabled={form.processing}
                        loading={form.processing}
                        loadingLabel="Memproses..."
                    >
                        {register.submitLabel}
                    </Button>
                </form>

                <AuthFooterPrompt
                    prompt={register.loginPrompt}
                    cta={register.loginCta}
                    href={register.loginHref}
                />
            </div>
        </div>
    );
}
