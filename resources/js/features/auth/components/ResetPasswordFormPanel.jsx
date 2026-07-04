import { useForm, usePage } from '@inertiajs/react';

import Button from '@/components/ui/Button';
import Notice from '@/components/ui/Notice';
import { dismissToast, showErrorToast, showLoadingToast } from '@/components/feedback/toast';
import { applyClientErrors, getAuthFormMessage, getFirstInlineError, validateResetPasswordForm } from '@/features/auth/authFormFeedback';
import AuthFooterPrompt from '@/features/auth/components/AuthFooterPrompt';
import AuthHeading from '@/features/auth/components/AuthHeading';
import AuthInput from '@/features/auth/components/AuthInput';
import PasswordField from '@/features/auth/components/PasswordField';

export default function ResetPasswordFormPanel({ resetPassword }) {
    const { props } = usePage();
    const form = useForm({
        token: resetPassword.token,
        email: resetPassword.email ?? '',
        password: '',
        password_confirmation: '',
    });

    function submit(event) {
        event.preventDefault();

        const clientErrors = validateResetPasswordForm(form.data);

        if (Object.keys(clientErrors).length > 0) {
            applyClientErrors(form, clientErrors);

            return;
        }

        form.clearErrors();

        let loadingToastId = null;
        let requestFailed = false;

        form.post('/reset-password', {
            onStart: () => {
                loadingToastId = showLoadingToast({
                    title: 'Memproses',
                    message: 'Sedang menyimpan password baru Anda.',
                });
            },
            onError: (errors) => {
                requestFailed = true;

                if (loadingToastId) {
                    dismissToast(loadingToastId);
                }

                showErrorToast({
                    title: 'Reset password gagal',
                    message: getAuthFormMessage(errors) || getFirstInlineError(errors, ['email', 'password', 'password_confirmation']) || 'Periksa kembali data reset password Anda.',
                });
            },
            onFinish: () => {
                if (loadingToastId && !requestFailed) {
                    dismissToast(loadingToastId);
                }
            },
        });
    }

    const authMessage = getAuthFormMessage(form.errors);

    return (
        <div className="flex min-h-full flex-col px-5 py-5 sm:px-8 sm:py-7 xl:px-10 xl:py-8">
            <div className="mx-auto flex w-full max-w-[442px] flex-1 flex-col justify-center">
                <AuthHeading title={resetPassword.title} subtitle={resetPassword.subtitle} />

                <form className="mt-6 space-y-3 sm:mt-8" onSubmit={submit}>
                    {props.flash?.error ? <Notice tone="danger">{props.flash.error}</Notice> : null}
                    {authMessage ? <Notice tone="danger">{authMessage}</Notice> : null}

                    <AuthInput
                        label={resetPassword.emailLabel}
                        type="email"
                        name="email"
                        placeholder={resetPassword.emailPlaceholder}
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        error={form.errors.email || Boolean(authMessage)}
                        required
                    />
                    <PasswordField
                        label={resetPassword.passwordLabel}
                        name="password"
                        placeholder={resetPassword.passwordPlaceholder}
                        autoComplete="new-password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        error={form.errors.password}
                        required
                    />
                    <PasswordField
                        label={resetPassword.passwordConfirmationLabel}
                        name="password_confirmation"
                        placeholder={resetPassword.passwordConfirmationPlaceholder}
                        autoComplete="new-password"
                        value={form.data.password_confirmation}
                        onChange={(event) => form.setData('password_confirmation', event.target.value)}
                        error={form.errors.password_confirmation}
                        required
                    />

                    <Button
                        type="submit"
                        size="md"
                        fullWidth
                        disabled={form.processing}
                        loading={form.processing}
                        loadingLabel="Memproses..."
                        className="font-medium text-xs sm:text-sm py-3"
                    >
                        {resetPassword.submitLabel}
                    </Button>
                </form>

                <AuthFooterPrompt
                    prompt={resetPassword.loginPrompt}
                    cta={resetPassword.loginCta}
                    href={resetPassword.loginHref}
                />
            </div>
        </div>
    );
}
