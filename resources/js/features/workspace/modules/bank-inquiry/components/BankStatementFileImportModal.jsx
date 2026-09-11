import React, { useState, useRef } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import { AlertTriangleFilledIcon } from '@/features/workspace/shared/Icons';
import axios from 'axios';
import { parseBankStatementFile } from '../reconciliationExcelParser';

export default function BankStatementFileImportModal({
    open,
    onClose,
    onImportSuccess,
    bankName = '',
    expectedAccountNumber = '',
    accountId = null,
}) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const fileInputRef = useRef(null);

    const handleReset = () => {
        setFile(null);
        setLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        handleReset();
        onClose?.();
    };

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
        }
    };

    const handleLanjut = async () => {
        if (!file) return;

        setLoading(true);
        try {
            let parsedResult = null;
            try {
                parsedResult = await parseBankStatementFile(file);
            } catch {
                // If SheetJS parsing has error, let backend handle/validate
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('account_number', expectedAccountNumber || '');
            if (accountId) formData.append('account_id', accountId);
            if (bankName) formData.append('bank_name', bankName);
            if (parsedResult?.rows?.length) {
                formData.append('parsed_rows', JSON.stringify(parsedResult.rows));
            }

            const response = await axios.post('/api/backend/bank-statements/import-file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data?.success) {
                handleReset();
                onClose?.();
                onImportSuccess?.(response.data);
            } else {
                throw new Error(response.data?.message || 'Gagal memproses file mutasi.');
            }
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                `Gagal impor file mutasi ${file.name} . Nomor rekening tidak sama dengan internet banking`;
            setErrorMessage(msg);
            setIsErrorModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Modal Impor File Mutasi Internet Banking */}
            <WorkspaceDialog
                open={open}
                onClose={handleClose}
                title="Impor File Mutasi Internet Banking"
                maxWidthClassName="max-w-[500px]"
                contentClassName="bg-white px-6 pt-6 pb-6"
                headerIcon={null}
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <label className="w-[110px] shrink-0 text-sm font-normal text-slate-700">
                            File Mutasi <span className="text-red-500">*</span>
                        </label>

                        <div className="flex flex-1 items-center justify-between h-[38px] px-3 border border-slate-300 rounded-[4px] bg-white min-w-0">
                            <span className={`text-sm truncate min-w-0 flex-1 mr-2 ${file ? 'text-slate-800' : 'text-slate-400'}`}>
                                {file ? file.name : 'Pilih file...'}
                            </span>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="shrink-0 p-0.5 text-slate-500 hover:text-brand-blue transition cursor-pointer"
                                aria-label="Pilih file"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                                    <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
                                </svg>
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls,.txt"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            variant="brand-blue"
                            size="md"
                            onClick={handleLanjut}
                            disabled={!file}
                            loading={loading}
                            loadingLabel="Memproses..."
                            className="min-w-[80px] rounded-[4px]"
                        >
                            Lanjut
                        </Button>
                    </div>
                </div>
            </WorkspaceDialog>

            {/* Modal Error Validasi Pemrosesan (Matching Image 3) */}
            <WorkspaceDialog
                open={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
                title="Terjadi Permasalahan pada Pemrosesan"
                headerIcon={AlertTriangleFilledIcon}
                maxWidthClassName="max-w-[480px]"
                contentClassName="bg-white px-6 pt-5 pb-3"
                footerClassName="bg-white px-5 pb-4 pt-1"
                footer={(
                    <div className="flex justify-end w-full">
                        <Button
                            variant="brand-blue"
                            size="md"
                            onClick={() => setIsErrorModalOpen(false)}
                            className="min-w-[80px] rounded-[4px]"
                        >
                            OK
                        </Button>
                    </div>
                )}
            >
                <div className="flex items-start gap-4">
                    <img
                        src="/assets/images/pop-up-warning-icon.svg"
                        className="h-14 w-14 shrink-0"
                        alt="Warning"
                        aria-hidden="true"
                    />

                    <div className="min-w-0 flex-1 pt-1.5 space-y-1">
                        <p className="text-sm font-normal text-slate-800">
                            Silakan perbaiki permasalahan berikut ini:
                        </p>
                        <p className="text-sm font-normal text-[#A20025] leading-relaxed break-words">
                            {errorMessage}
                        </p>
                    </div>
                </div>
            </WorkspaceDialog>
        </>
    );
}
