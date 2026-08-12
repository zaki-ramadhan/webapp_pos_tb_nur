import { useState } from 'react';
import { useForm } from '@inertiajs/react';

import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { dismissToast, showErrorToast, showLoadingToast } from '@/components/feedback/toast';
import { applyClientErrors, getAuthFormMessage, getFirstInlineError, validateRegisterForm } from '@/features/auth/authFormFeedback';
import AuthFooterPrompt from '@/features/auth/components/AuthFooterPrompt';
import AuthHeading from '@/features/auth/components/AuthHeading';
import AuthInput from '@/features/auth/components/AuthInput';
import PasswordField from '@/features/auth/components/PasswordField';

export default function RegisterFormPanel({ register }) {
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
            name: cleanedName,
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
            onError: (err) => {
                requestFailed = true;
                if (loadingToastId) dismissToast(loadingToastId);
                const message = getAuthFormMessage(err, 'Pendaftaran gagal. Silakan periksa kembali data Anda.');
                const inlineError = getFirstInlineError(err);
                if (inlineError) {
                    form.setError(inlineError.field, inlineError.message);
                }
                showErrorToast({ title: 'Gagal', message });
            },
            onFinish: () => {
                if (requestFailed && loadingToastId) {
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
                    <AuthInput
                        id="register-name"
                        name="name"
                        type="text"
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
                        variant="brand-pink"
                        size="md"
                        fullWidth
                        disabled={form.processing}
                        loading={form.processing}
                        loadingLabel="Memproses..."
                        className="font-medium text-xs sm:text-sm py-3"
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
