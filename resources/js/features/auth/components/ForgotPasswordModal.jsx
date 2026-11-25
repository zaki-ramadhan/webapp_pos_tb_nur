import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import Button from '@/components/ui/Button';
import Notice from '@/components/ui/Notice';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { dismissToast, showErrorToast, showLoadingToast } from '@/components/feedback/toast';
import { applyClientErrors, getAuthFormMessage, getFirstInlineError, validateForgotPasswordForm } from '@/features/auth/authFormFeedback';
import AuthInput from '@/features/auth/components/AuthInput';

export default function ForgotPasswordModal({ open, onClose, modal = {} }) {
    const [step, setStep] = useState('input');
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [cooldownSeconds, setCooldownSeconds] = useState(0);

    const form = useForm({
        email: '',
    });

    useEffect(() => {
        if (!open) {
            setStep('input');
            setSubmittedEmail('');
            form.reset('email');
            form.clearErrors();
        }
    }, [open]);

    useEffect(() => {
        if (cooldownSeconds <= 0) return;

        const interval = setInterval(() => {
            setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldownSeconds]);

    function submit(event) {
        event?.preventDefault?.();

        if (cooldownSeconds > 0) return;

        const clientErrors = validateForgotPasswordForm(form.data);

        if (Object.keys(clientErrors).length > 0) {
            applyClientErrors(form, clientErrors);
            return;
        }

        form.clearErrors();

        let loadingToastId = null;
        let requestFailed = false;

        form.post('/forgot-password', {
            preserveScroll: true,
            preserveState: true,
            onStart: () => {
                loadingToastId = showLoadingToast({
                    title: 'Memproses',
                    message: 'Sedang menyiapkan permintaan reset password.',
                });
            },
            onError: (errors) => {
                requestFailed = true;

                if (loadingToastId) {
                    dismissToast(loadingToastId);
                }

                if (errors?.email && (errors.email.includes('baru saja dikirim') || errors.email.includes('tunggu'))) {
                    setCooldownSeconds(60);
                }

                showErrorToast({
                    title: 'Permintaan gagal',
                    message: getAuthFormMessage(errors) || getFirstInlineError(errors, ['email']) || 'Periksa kembali alamat email yang Anda masukkan.',
                });
            },
            onFinish: () => {
                if (loadingToastId && !requestFailed) {
                    dismissToast(loadingToastId);
                }
            },
            onSuccess: () => {
                setSubmittedEmail(form.data.email);
                setStep('success');
                setCooldownSeconds(60);
            }
        });
    }

    const authMessage = getAuthFormMessage(form.errors);

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            disableClose={form.processing}
            title={step === 'input' ? (modal?.title || 'Lupa Password') : 'Informasi Reset Password'}
            closeLabel={modal?.closeLabel || 'Tutup'}
            maxWidthClassName="max-w-[480px]"
            contentClassName="bg-white px-5 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4"
            footer={
                step === 'input' ? (
                    <div className="flex items-center justify-end gap-2 w-full">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={onClose}
                            disabled={form.processing}
                            className="min-w-[80px] rounded-[4px] text-xs sm:text-sm"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="forgot-password-form"
                            onClick={submit}
                            variant="brand-blue"
                            size="md"
                            loading={form.processing}
                            loadingLabel="Memproses..."
                            disabled={form.processing || cooldownSeconds > 0}
                            className="min-w-[120px] rounded-[4px] text-xs sm:text-sm font-medium"
                        >
                            {cooldownSeconds > 0
                                ? `Tunggu (${cooldownSeconds}s)`
                                : (modal?.submitLabel || 'Reset Password')}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-end w-full">
                        <Button
                            type="button"
                            variant="brand-blue"
                            size="md"
                            onClick={onClose}
                            className="min-w-[80px] rounded-[4px] text-xs sm:text-sm"
                        >
                            OK
                        </Button>
                    </div>
                )
            }
        >
            {step === 'input' ? (
                <form id="forgot-password-form" className="space-y-4" onSubmit={submit}>
                    <AuthInput
                        label={modal?.emailLabel || modal?.identifierLabel || 'Email'}
                        name="email"
                        placeholder={modal?.emailPlaceholder || modal?.identifierPlaceholder || 'contoh@gmail.com'}
                        type="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={form.data.email}
                        onChange={(event) => {
                            form.clearErrors('email');
                            form.setData('email', event.target.value);
                        }}
                        error={form.errors.email}
                        required
                    />

                    {authMessage ? <Notice tone="danger">{authMessage}</Notice> : null}
                </form>
            ) : (
                <div className="space-y-3 py-1">
                    <p className="text-xs sm:text-sm leading-6 text-slate-700">
                        Jika alamat email <strong className="text-slate-900 font-semibold break-all">{submittedEmail}</strong> terdaftar di sistem, link verifikasi telah dikirimkan. Silakan periksa kotak masuk atau folder spam email Anda.
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs sm:text-sm border-t border-slate-100">
                        <span className="text-slate-500">Tidak menerima email?</span>
                        <button
                            type="button"
                            disabled={cooldownSeconds > 0 || form.processing}
                            onClick={() => {
                                if (cooldownSeconds > 0) return;
                                submit();
                            }}
                            className={`font-medium transition-colors ${
                                cooldownSeconds > 0
                                    ? 'text-slate-400 cursor-not-allowed'
                                    : 'text-brand-blue hover:underline cursor-pointer'
                            }`}
                        >
                            {cooldownSeconds > 0 ? `Kirim ulang (${cooldownSeconds}s)` : 'Kirim Ulang Link'}
                        </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 pt-1">
                        Apabila Anda belum menerima email verifikasi, silakan hubungi tim dukungan kami di{' '}
                        <a href="mailto:support@tb-nur.shop" className="text-brand-blue hover:underline font-medium">
                            support@tb-nur.shop
                        </a>.
                    </p>
                </div>
            )}
        </WorkspaceDialog>
    );
}
