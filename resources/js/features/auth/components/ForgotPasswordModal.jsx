import { useForm, usePage } from '@inertiajs/react';

import Button from '@/components/ui/Button';
import ModalBase from '@/components/ui/ModalBase';
import Notice from '@/components/ui/Notice';
import { dismissToast, showErrorToast, showLoadingToast } from '@/components/feedback/toast';
import { applyClientErrors, getAuthFormMessage, getFirstInlineError, validateForgotPasswordForm } from '@/features/auth/authFormFeedback';
import AuthInput from '@/features/auth/components/AuthInput';

function CloseButton({ onClose, label }) {
    return (
        <button
            type="button"
            onClick={onClose}
            aria-label={label}
            className="absolute -right-3 -top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#efe5d6] bg-white text-[#5b4a3a] shadow-[0_12px_25px_rgba(47,36,25,0.14)] transition hover:bg-[#fffaf3]"
        >
            <span className="text-[22px] leading-none">&times;</span>
        </button>
    );
}

export default function ForgotPasswordModal({ open, onClose, modal }) {
    const { props } = usePage();
    const form = useForm({
        identifier: '',
    });

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
                    message: getAuthFormMessage(errors) || getFirstInlineError(errors, ['identifier']) || 'Periksa kembali data akun yang Anda masukkan.',
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
        <ModalBase
            open={open}
            onBackdropClick={onClose}
            className="bg-[rgba(63,89,129,0.42)] px-4 py-5 backdrop-blur-[2px] sm:px-6 sm:py-8"
            panelClassName="max-w-[520px] overflow-visible rounded-[20px] border border-white/70 bg-white px-0 py-0 shadow-[0_40px_90px_rgba(47,36,25,0.18)]"
        >
            <div className="relative px-5 py-5 sm:px-7 sm:py-7">
                <CloseButton onClose={onClose} label={modal.closeLabel} />

                <div className="text-center">
                    <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#5c5776]">{modal.title}</h2>
                </div>

                <form className="mt-6 space-y-4" onSubmit={submit}>
                    <AuthInput
                        label={modal.identifierLabel}
                        hint={modal.identifierHint}
                        name="identifier"
                        placeholder={modal.identifierPlaceholder}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={form.data.identifier}
                        onChange={(event) => form.setData('identifier', event.target.value)}
                        error={authMessage ? '' : form.errors.identifier}
                    />

                    {authMessage ? <Notice tone="danger">{authMessage}</Notice> : null}
                    {props.flash?.status ? <Notice tone="success">{props.flash.status}</Notice> : null}
                    {props.flash?.error ? <Notice tone="danger">{props.flash.error}</Notice> : null}

                    <div className="flex justify-end pt-2">
                        <Button type="submit" className="min-w-[160px] rounded-[10px] bg-[#f2356d] hover:bg-[#e02d63]" disabled={form.processing}>
                            {modal.submitLabel}
                        </Button>
                    </div>
                </form>
            </div>
        </ModalBase>
    );
}
