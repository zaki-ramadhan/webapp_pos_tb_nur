import { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon } from '@/features/workspace/shared/Icons';
import TextInput from '@/components/ui/TextInput';

export default function DashboardFormModal({
    open,
    mode,
    modal,
    initialValue = '',
    onClose,
    onSubmit,
    onDelete,
}) {
    const [name, setName] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        setName(initialValue);
        setIsSubmitting(false);
        setIsDeleting(false);
    }, [initialValue, open]);

    const isEditMode = mode === 'edit';
    const trimmedName = name.trim();

    async function handleSubmit(event) {
        event.preventDefault();

        if (!trimmedName || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            await Promise.resolve(onSubmit?.(trimmedName));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (isDeleting) {
            return;
        }

        setIsDeleting(true);

        try {
            await Promise.resolve(onDelete?.());
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <ModalBase
            open={open}
            onBackdropClick={isSubmitting || isDeleting ? undefined : onClose}
            className="bg-[rgba(22,31,52,0.62)]"
            panelClassName="max-w-[602px] overflow-hidden rounded-[6px] px-0 py-0 shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
        >
            <div className="border-b border-[#0f366d] bg-[#163a6d] px-3 py-2.5 text-white">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-sm font-medium">{modal.title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] text-white/90 cursor-pointer"
                        aria-label={modal.closeLabel}
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white px-3 py-7">
                <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-center">
                    <label htmlFor="dashboard-name" className="text-xs sm:text-sm font-medium text-[#2c344a]">
                        {modal.nameLabel}
                    </label>

                    <div className="relative">
                        <TextInput
                            id="dashboard-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="h-9 w-full rounded-[4px] border border-[#cdd4e3] px-3 pr-9 text-xs sm:text-sm text-[#2c344a] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
                            autoFocus
                        />

                        {isEditMode && trimmedName ? (
                            <button
                                type="button"
                                onClick={() => setName('')}
                                className="absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-[4px] text-[#2c344a]"
                                aria-label={modal.clearLabel}
                            >
                                <CloseIcon className="h-3.5 w-3.5" />
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                        {isEditMode ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                loading={isDeleting}
                                loadingLabel="Memproses..."
                                className="rounded-[4px] px-3 font-medium text-[#1f63ad] hover:no-underline"
                            >
                                {modal.deleteLabel}
                            </Button>
                        ) : null}
                    </div>

                    <Button
                        type="submit"
                        size="sm"
                        disabled={!trimmedName || isSubmitting}
                        loading={isSubmitting}
                        loadingLabel="Memproses..."
                        className="min-w-[88px] rounded-[4px] bg-[#234d97] px-4 hover:bg-[#1d4386]"
                    >
                        {modal.submitLabel}
                    </Button>
                </div>
            </form>
        </ModalBase>
    );
}
