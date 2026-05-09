import { useEffect, useState } from 'react';

import ModalBase from '@/components/ui/ModalBase';
import { CloseIcon } from '@/features/workspace/shared/Icons';

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

    useEffect(() => {
        if (!open) {
            return;
        }

        setName(initialValue);
    }, [initialValue, open]);

    const isEditMode = mode === 'edit';
    const trimmedName = name.trim();

    function handleSubmit(event) {
        event.preventDefault();

        if (!trimmedName) {
            return;
        }

        onSubmit?.(trimmedName);
    }

    return (
        <ModalBase
            open={open}
            className="bg-[rgba(22,31,52,0.62)]"
            panelClassName="max-w-[602px] overflow-hidden rounded-[6px] px-0 py-0 shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
        >
            <div className="border-b border-[#0f366d] bg-[#163a6d] px-3 py-2 text-white">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-[16px] font-medium">{modal.title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-white/90"
                        aria-label={modal.closeLabel}
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white px-3 py-7">
                <div className="grid gap-4 md:grid-cols-[182px_minmax(0,1fr)] md:items-center">
                    <label htmlFor="dashboard-name" className="text-[15px] font-medium text-[#2c344a]">
                        {modal.nameLabel}
                    </label>

                    <div className="relative">
                        <input
                            id="dashboard-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="h-10 w-full rounded-[4px] border border-[#cdd4e3] px-3 pr-9 text-[15px] text-[#2c344a] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
                            autoFocus
                        />

                        {isEditMode && trimmedName ? (
                            <button
                                type="button"
                                onClick={() => setName('')}
                                className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-[4px] text-[#2c344a]"
                                aria-label={modal.clearLabel}
                            >
                                <CloseIcon />
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                        {isEditMode ? (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="inline-flex h-9 items-center rounded-[4px] px-3 text-[15px] font-medium text-[#1f63ad]"
                            >
                                {modal.deleteLabel}
                            </button>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={!trimmedName}
                        className="inline-flex h-10 min-w-[88px] items-center justify-center rounded-[4px] bg-[#234d97] px-5 text-[15px] font-medium text-white disabled:opacity-55"
                    >
                        {modal.submitLabel}
                    </button>
                </div>
            </form>
        </ModalBase>
    );
}
