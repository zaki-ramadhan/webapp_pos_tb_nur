import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Notice from '@/components/ui/Notice';
import { dismissToast, showErrorToast, showLoadingToast } from '@/components/feedback/toast';
import { applyClientErrors, getAuthFormMessage, getFirstInlineError, validateLoginForm } from '@/features/auth/authFormFeedback';
import AuthInput from '@/features/auth/components/AuthInput';
import AuthFooterPrompt from '@/features/auth/components/AuthFooterPrompt';
import AuthHeading from '@/features/auth/components/AuthHeading';
import ForgotPasswordModal from '@/features/auth/components/ForgotPasswordModal';
import PasswordField from '@/features/auth/components/PasswordField';
import SocialButton from '@/features/auth/components/SocialButton';

export default function LoginFormPanel({ login }) {
    const { props } = usePage();
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const form = useForm({
        identifier: '',
        password: '',
    });

    function submit(event) {
        event.preventDefault();

        const clientErrors = validateLoginForm(form.data);

        if (Object.keys(clientErrors).length > 0) {
            applyClientErrors(form, clientErrors);

            return;
        }

        form.clearErrors();

        let loadingToastId = null;
        let requestFailed = false;

        form.post('/login', {
            onStart: () => {
                loadingToastId = showLoadingToast({
                    title: 'Memproses',
                    message: 'Sedang memverifikasi akun Anda.',
                });
            },
            onError: (errors) => {
                requestFailed = true;

                if (loadingToastId) {
                    dismissToast(loadingToastId);
                }

                showErrorToast({
                    title: 'Login gagal',
                    message: getAuthFormMessage(errors) || getFirstInlineError(errors, ['identifier', 'password']) || 'Periksa kembali data login Anda.',
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
                <AuthHeading title={login.title} subtitle={login.subtitle} />

                <form className="mt-6 space-y-4 sm:mt-8" onSubmit={submit}>
                    {props.flash?.status ? <Notice tone="success">{props.flash.status}</Notice> : null}
                    {authMessage ? <Notice tone="danger">{authMessage}</Notice> : null}
                    <AuthInput
                        label={login.identifierLabel}
                        name="identifier"
                        placeholder={login.identifierPlaceholder}
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={form.data.identifier}
                        onChange={(event) => form.setData('identifier', event.target.value)}
                        error={form.errors.identifier || Boolean(authMessage)}
                    />
                    <PasswordField
                        label={login.passwordLabel}
                        name="password"
                        placeholder={login.passwordPlaceholder}
                        autoComplete="current-password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        error={form.errors.password || Boolean(authMessage)}
                    />

                    <div className="text-right">
                        <button
                            type="button"
                            onClick={() => setForgotPasswordOpen(true)}
                            className="text-[15px] text-[#4285f4] hover:underline"
                        >
                            {login.forgotPassword}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        disabled={form.processing}
                        loading={form.processing}
                        loadingLabel="Memproses..."
                    >
                        {login.submitLabel}
                    </Button>

                    <div className="pt-3">
                        <Divider label={login.socialDivider} />
                    </div>

                    <SocialButton
                        label={`Masuk dengan ${login.googleLabel}`}
                        href={login.googleHref}
                        disabled={form.processing}
                    />
                </form>

                <AuthFooterPrompt
                    prompt={login.signupPrompt}
                    cta={login.signupCta}
                    href={login.signupHref}
                />
            </div>

            <ForgotPasswordModal
                open={forgotPasswordOpen}
                onClose={() => setForgotPasswordOpen(false)}
                modal={login.forgotPasswordModal}
            />
        </div>
    );
}
