import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';

function SessionExpiredIllustration() {
    return (
        <svg viewBox="0 0 56 56" className="h-16 w-16 shrink-0" aria-hidden="true">
            <path
                d="M28 6 45 18v20L28 50 11 38V18 18L28 6Z"
                fill="none"
                stroke="var(--color-warning)"
                strokeWidth="2.4"
                strokeLinejoin="round"
            />
            <circle cx="28" cy="20" r="3" fill="var(--color-warning)" />
            <path
                d="M28 27v14"
                fill="none"
                stroke="var(--color-warning)"
                strokeWidth="3.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function SessionExpiredModal({ open, onClose, onConfirm }) {
    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Sesi Login Berakhir"
            maxWidthClassName="max-w-[480px]"
            footer={
                <div className="flex justify-end">
                    <Button onClick={onConfirm} variant="primary" size="md" className="min-w-[80px] rounded-[4px]">
                        Login Kembali
                    </Button>
                </div>
            }
        >
            <div className="flex items-start gap-5">
                <SessionExpiredIllustration />
                <div className="min-w-0 flex-1 pt-2">
                    <p className="text-xs sm:text-sm leading-6 text-brand-dark">
                        Sesi login Anda telah berakhir demi keamanan. Silakan login kembali untuk melanjutkan aktivitas Anda.
                    </p>
                </div>
            </div>
        </WorkspaceDialog>
    );
}

export function showSessionExpiredModal() {
    return new Promise((resolve) => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const root = createRoot(div);

        function onDestroy() {
            root.unmount();
            div.remove();
        }

        function handleClose() {
            resolve(false);
            onDestroy();
        }

        function handleConfirm() {
            resolve(true);
            onDestroy();
        }

        root.render(
            <SessionExpiredModal
                open={true}
                onClose={handleClose}
                onConfirm={handleConfirm}
            />
        );
    });
}
