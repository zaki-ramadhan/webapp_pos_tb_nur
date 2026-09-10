import React, { useState, useRef } from 'react';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import Button from '@/components/ui/Button';
import { FolderOpen, TriangleAlert } from 'lucide-react';
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

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-1 items-center justify-between h-[38px] px-3 border border-slate-300 rounded-[4px] bg-white cursor-pointer hover:border-brand-blue transition select-none"
                        >
                            <span className={`text-sm truncate ${file ? 'text-slate-800' : 'text-slate-400'}`}>
                                {file ? file.name : 'Pilih file...'}
                            </span>
                            <FolderOpen className="h-4.5 w-4.5 shrink-0 text-slate-600 ml-2" />

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
                            className="min-w-[90px] px-5 rounded-[4px] text-sm font-medium shadow-none"
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
                headerIcon={() => <TriangleAlert className="h-4 w-4 shrink-0 text-yellow-400" />}
                maxWidthClassName="max-w-[480px]"
                contentClassName="bg-white px-6 pt-5 pb-3"
                footerClassName="bg-white px-5 pb-4 pt-1"
                footer={(
                    <div className="flex justify-end w-full">
                        <Button
                            variant="brand-blue"
                            size="md"
                            onClick={() => setIsErrorModalOpen(false)}
                            className="min-w-[70px] px-5 rounded-[4px] text-sm shadow-none"
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
