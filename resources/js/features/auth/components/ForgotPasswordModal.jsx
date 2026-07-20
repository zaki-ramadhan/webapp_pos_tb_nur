import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

import ModalBase from '@/components/ui/ModalBase';
import Notice from '@/components/ui/Notice';
import { dismissToast, showErrorToast, showLoadingToast } from '@/components/feedback/toast';
import { applyClientErrors, getAuthFormMessage, getFirstInlineError, validateForgotPasswordForm } from '@/features/auth/authFormFeedback';
import AuthInput from '@/features/auth/components/AuthInput';

export default function ForgotPasswordModal({ open, onClose, modal }) {
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
        event.preventDefault();

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

                showErrorToast({
                    title: 'Permintaan gagal',
                    message: getAuthFormMessage(errors) || getFirstInlineError(errors, ['email']) || 'Periksa kembali data akun yang Anda masukkan.',
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
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-slate-950/55 px-4 py-5 sm:px-6 sm:py-8"
            panelClassName="w-full max-w-[460px] overflow-visible rounded-[12px] bg-white px-0 py-0 shadow-modal-auth"
        >
            <div className="relative">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={modal.closeLabel || 'Tutup'}
                    className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:text-red-800 hover:border-red-200 active:text-red-950 shadow-card-subtle transition-colors cursor-pointer"
                >
                    <span className="text-sm font-semibold leading-none">&times;</span>
                </button>

                {step === 'input' ? (
                    <div className="px-6 py-6">
                        <h2 className="text-center text-lg font-semibold text-text-dark">{modal.title || 'Lupa Password'}</h2>

                        <form className="mt-6 space-y-4" onSubmit={submit}>
                            <AuthInput
                                label="Email Akun Anda"
                                name="email"
                                placeholder="Masukkan alamat email Anda"
                                type="email"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                error={authMessage ? '' : form.errors.email}
                                required
                            />

                            {authMessage ? <Notice tone="danger">{authMessage}</Notice> : null}

                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="py-2.5 px-5 rounded-[4px] bg-brand-blue hover:bg-brand-blue-hover text-xs sm:text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {form.processing ? 'Memproses...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="px-6 py-6 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <svg className="h-5 w-5 text-blue-500 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-base font-semibold text-blue-440">Informasi reset password</h3>
                        </div>

                        <p className="text-sm leading-6 text-blue-550">
                            Link verifikasi telah dikirim ke email <strong className="text-slate-800 font-bold break-all">{submittedEmail}</strong>. Silakan periksa kotak masuk email Anda. Jika link verifikasi tidak ditemukan, mohon periksa folder spam. Apabila Anda masih belum menerima email verifikasi, silakan hubungi tim support kami di <a href="mailto:support@cpssoft.com" className="text-blue-500 hover:underline">support@cpssoft.com</a>
                        </p>

                        <div className="flex justify-center pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="py-2.5 min-w-[70px] px-5 rounded-[4px] bg-brand-blue hover:bg-brand-blue-hover text-xs sm:text-sm font-medium text-white shadow-sm transition-colors cursor-pointer"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ModalBase>
    );
}
