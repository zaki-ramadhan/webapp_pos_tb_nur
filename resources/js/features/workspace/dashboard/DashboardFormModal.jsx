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
            className="bg-modal-overlay-light"
            panelClassName="max-w-[602px] overflow-hidden rounded-[6px] px-0 py-0 shadow-modal-dialog"
        >
            <div className="border-b border-illustration-danger-border bg-illustration-danger-border px-3 py-2.5 text-white">
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
                    <label htmlFor="dashboard-name" className="text-xs sm:text-sm font-medium text-abc-label-dark">
                        {modal.nameLabel}
                    </label>

                    <div>
                        <TextInput
                            id="dashboard-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                        {isEditMode ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="md"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                loading={isDeleting}
                                loadingLabel="Memproses..."
                                className="rounded-[4px] px-3 font-medium text-brand-blue-dark hover:no-underline"
                            >
                                {modal.deleteLabel}
                            </Button>
                        ) : null}
                    </div>

                    <Button
                        type="submit"
                        size="md"
                        disabled={!trimmedName || isSubmitting}
                        loading={isSubmitting}
                        loadingLabel="Memproses..."
                        className="min-w-[88px] rounded-[4px] bg-brand-blue-hover px-4 hover:bg-brand-blue-darker"
                    >
                        {modal.submitLabel}
                    </Button>
                </div>
            </form>
        </ModalBase>
    );
}
