import { useForm } from '@inertiajs/react';

import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Notice from '@/components/ui/Notice';
import TextInput from '@/components/ui/TextInput';
import { dismissToast, showErrorToast, showLoadingToast } from '@/components/feedback/toast';
import { applyClientErrors, getAuthFormMessage, getFirstInlineError, validateRegisterForm } from '@/features/auth/authFormFeedback';
import AuthFooterPrompt from '@/features/auth/components/AuthFooterPrompt';
import AuthHeading from '@/features/auth/components/AuthHeading';
import AuthInput from '@/features/auth/components/AuthInput';
import PasswordField from '@/features/auth/components/PasswordField';

function NameField({ prefix, label, value, onChange, error }) {
    return (
        <FormField label={label}>
            <TextInput prefix={prefix} value={value} onChange={onChange} error={error} />
        </FormField>
    );
}

export default function RegisterFormPanel({ register }) {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    function submit(event) {
        event.preventDefault();

        const clientErrors = validateRegisterForm(form.data, {
            showPhoneField: register.showPhoneField,
        });

        if (Object.keys(clientErrors).length > 0) {
            applyClientErrors(form, clientErrors);

            return;
        }

        form.clearErrors();

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
        <div className="flex h-full flex-col px-5 py-5 sm:px-8 sm:py-7 xl:px-10 xl:py-8">
            <div className="mx-auto flex w-full max-w-[442px] flex-1 flex-col justify-center">
                <AuthHeading
                    brand={register.brand}
                    title={register.title}
                    subtitle={register.subtitle}
                />

                <form className="mt-6 space-y-4 sm:mt-8" onSubmit={submit}>
                    <NameField
                        prefix={register.namePrefix}
                        label={register.nameLabel}
                        value={form.data.name}
                        onChange={(event) => form.setData('name', event.target.value)}
                        error={form.errors.name}
                    />
                    <AuthInput
                        label={register.emailLabel}
                        type="email"
                        name="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        error={form.errors.email}
                    />
                    {register.showPhoneField ? (
                        <AuthInput
                            label={register.phoneLabel}
                            hint={register.phoneHint}
                            name="phone"
                            autoComplete="tel"
                            value={form.data.phone}
                            onChange={(event) => form.setData('phone', event.target.value)}
                            error={form.errors.phone}
                        />
                    ) : null}
                    <PasswordField
                        label={register.passwordLabel}
                        name="password"
                        autoComplete="new-password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        error={form.errors.password}
                    />

                    <Notice tone="info">{register.internalNote}</Notice>

                    <Button type="submit" fullWidth disabled={form.processing}>
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
