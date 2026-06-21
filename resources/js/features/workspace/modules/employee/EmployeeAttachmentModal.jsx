import { useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { DownloadIcon, PaperclipIcon, LoadingIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import { uploadBackendAttachment } from '@/features/workspace/backend/workspaceBackendApi';
import { formatIsoDate } from '@/features/workspace/backend/workspaceBackendAdapters';
import { formatFileSize } from '@/features/workspace/shared/transactionFormatters';


export default function EmployeeAttachmentModal({
    open,
    onClose,
    values,
    setValues,
}) {
    const [docName, setDocName] = useState('');
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [uploadError, setUploadError] = useState('');

    async function handleUploadDocument(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError('');

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            setUploadError('Gagal mengunggah: Format file tidak didukung.');
            return;
        }

        setUploadingDoc(true);
        try {
            const res = await uploadBackendAttachment(file);
            if (res) {
                const newAttachment = {
                    id: res.id,
                    file_name: docName.trim() || res.file_name,
                    file_type: res.file_type,
                    file_size: res.file_size,
                    created_at: res.created_at ?? new Date().toISOString(),
                    url: res.url ?? `/storage/${res.file_path}`,
                };
                setValues((current) => ({
                    ...current,
                    attachments: [...(current.attachments ?? []), newAttachment],
                }));
                setDocName('');
                setUploadError('');
            }
        } catch (err) {
            setUploadError(err?.response?.data?.message ?? 'Gagal mengunggah berkas.');
        } finally {
            setUploadingDoc(false);
            event.target.value = '';
        }
    }

    function handleRemoveAttachment(id) {
        setValues((current) => ({
            ...current,
            attachments: (current.attachments ?? []).filter((item) => item.id !== id),
        }));
    }

    return (
        <WorkspaceDialog
            open={open}
            onClose={onClose}
            title="Dokumen Transaksi"
            closeLabel="Tutup"
            maxWidthClassName="max-w-[520px]"
        >
            <div className="space-y-4">
                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-x-4">
                    <span className="text-xs sm:text-sm font-medium text-[#1f2436]">Nama Dokumen</span>
                    <TextInput
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="Deskripsi dokumen"
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>

                <div>
                    <label className={`flex h-11 w-full items-center justify-center rounded-[6px] border text-xs sm:text-sm font-medium shadow-sm transition ${
                        uploadingDoc
                            ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                            : 'border-[#214d8d] bg-[#0f62b8] text-white cursor-pointer hover:brightness-105 active:brightness-95'
                    }`}>
                        {uploadingDoc ? (
                            <span className="flex items-center gap-2">
                                <LoadingIcon className="h-5 w-5 animate-spin" />
                                <span>Mengunggah Dokumen...</span>
                            </span>
                        ) : (
                            <span>Unggah Dokumen</span>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            disabled={uploadingDoc}
                            onChange={handleUploadDocument}
                        />
                    </label>
                </div>

                {uploadError && (
                    <p className="text-xs sm:text-sm text-[#db3e3e] bg-red-50 p-2 rounded border border-red-200">
                        {uploadError}
                    </p>
                )}

                <hr className="border-[#d8dde7]" />

                <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#1f2436] mb-2">Daftar Lampiran</h3>
                    {!(values.attachments?.length) ? (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#cfd6e2] rounded-[6px] py-8 bg-slate-50 text-slate-400">
                            <PaperclipIcon className="h-8 w-8 mb-2 text-slate-300" />
                            <span className="text-xs sm:text-sm font-normal">Tidak ada lampiran</span>
                        </div>
                    ) : (
                        <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                            {values.attachments.map((item) => {
                                const dateStr = formatIsoDate(item.created_at);
                                const sizeStr = formatFileSize(item.file_size);

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between border border-[#cfd6e2] rounded-[6px] px-3 py-2 bg-slate-50 hover:bg-slate-100/70 transition"
                                    >
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs sm:text-sm font-medium text-[#0f62b8] hover:underline truncate"
                                                title="Buka dokumen"
                                            >
                                                {item.file_name}
                                            </a>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                                {dateStr && <span>{dateStr}</span>}
                                                {dateStr && sizeStr && <span className="text-slate-300">•</span>}
                                                {sizeStr && <span>{sizeStr}</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0 ml-4">
                                            <a
                                                href={item.url}
                                                download={item.file_name}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1 rounded text-[#0f62b8] hover:bg-[#eef5ff] transition"
                                                title="Unduh dokumen"
                                                aria-label="Unduh lampiran"
                                            >
                                                <DownloadIcon className="h-4.5 w-4.5" />
                                            </a>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAttachment(item.id)}
                                                className="p-1 rounded hover:bg-red-50 text-[#db3e3e] transition"
                                                title="Hapus dokumen"
                                                aria-label="Hapus lampiran"
                                            >
                                                <TrashIcon className="h-4.5 w-4.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </WorkspaceDialog>
    );
}
