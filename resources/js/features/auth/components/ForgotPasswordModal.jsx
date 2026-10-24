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

    function submit(event) {
        event?.preventDefault?.();

        const clientErrors = validateForgotPasswordForm(form.data);

        if (Object.keys(clientErrors).length > 0) {
            applyClientErrors(form, clientErrors);
            return;
        }

        form.clearErrors();

        let loadingToastId = null;
        let requestFailed = false;

        form.transform((data) => ({
            ...data,
            identifier: data.email,
        })).post('/forgot-password', {
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

                showErrorToast({
                    title: 'Permintaan gagal',
                    message: getAuthFormMessage(errors) || getFirstInlineError(errors, ['email', 'identifier']) || 'Periksa kembali data akun yang Anda masukkan.',
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
                            variant="brand-blue"
                            size="md"
                            loading={form.processing}
                            loadingLabel="Memproses..."
                            disabled={form.processing}
                            className="min-w-[100px] rounded-[4px] text-xs sm:text-sm font-medium"
                        >
                            {modal?.submitLabel || 'Reset Password'}
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
                        label={modal?.identifierLabel || 'Email Akun Anda'}
                        name="email"
                        placeholder={modal?.identifierPlaceholder || 'Masukkan alamat email Anda'}
                        type="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={form.data.email}
                        onChange={(event) => {
                            form.clearErrors('email');
                            form.clearErrors('identifier');
                            form.setData('email', event.target.value);
                        }}
                        error={form.errors.email || form.errors.identifier}
                        required
                    />

                    {authMessage ? <Notice tone="danger">{authMessage}</Notice> : null}
                </form>
            ) : (
                <div className="space-y-3 py-1">
                    <p className="text-xs sm:text-sm leading-6 text-slate-700">
                        Link verifikasi telah dikirim ke email <strong className="text-slate-900 font-semibold break-all">{submittedEmail}</strong>. Silakan periksa kotak masuk email Anda. Jika link verifikasi tidak ditemukan, mohon periksa folder spam.
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">
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
