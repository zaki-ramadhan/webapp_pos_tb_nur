import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';

function SessionExpiredIllustration() {
    return (
        <img src="/assets/images/pop-up-warning-icon.svg" className="h-14 w-14 shrink-0" alt="Warning" aria-hidden="true" />
    );
}

export default function SessionExpiredModal({ open, onClose, onConfirm }) {
    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Sesi Login Berakhir"
            maxWidthClassName="max-w-[440px]"
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
