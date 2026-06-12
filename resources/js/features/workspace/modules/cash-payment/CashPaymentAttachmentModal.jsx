import { useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import { PaperclipIcon, TrashIcon } from '@/features/workspace/shared/Icons';
import { uploadBackendAttachment } from '@/features/workspace/backend/workspaceBackendApi';

export default function CashPaymentAttachmentModal({
    open,
    onClose,
    values,
    setValues,
    setStatus,
}) {
    const [docName, setDocName] = useState('');
    const [docDesc, setDocDesc] = useState('');
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
                    description: docDesc.trim(),
                    file_type: res.file_type,
                    url: res.url ?? `/storage/${res.file_path}`,
                };
                setValues((current) => ({
                    ...current,
                    attachments: [...(current.attachments ?? []), newAttachment],
                }));
                setDocName('');
                setDocDesc('');
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
            title="Kelola Lampiran Dokumen"
            closeLabel="Tutup kelola lampiran"
            maxWidthClassName="max-w-[520px]"
        >
            <div className="space-y-4">
                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <span className="text-xs sm:text-sm font-medium text-[#1f2436]">Nama Dokumen</span>
                    <TextInput
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        placeholder="Contoh: Bukti Transfer"
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>

                <div className="grid grid-cols-[130px_minmax(0,1fr)] items-center gap-x-4">
                    <span className="text-xs sm:text-sm font-medium text-[#1f2436]">Deskripsi</span>
                    <TextInput
                        value={docDesc}
                        onChange={(e) => setDocDesc(e.target.value)}
                        placeholder="Deskripsi singkat lampiran"
                        className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>

                <div>
                    <label className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[6px] border border-[#214d8d] bg-[#0f62b8] text-xs sm:text-sm font-medium text-white shadow-sm hover:brightness-105 active:brightness-95 transition">
                        {uploadingDoc ? (
                            <span className="animate-pulse">Mengunggah Dokumen...</span>
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
                            <span className="text-xs sm:text-sm font-medium">Tidak ada lampiran</span>
                        </div>
                    ) : (
                        <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                            {values.attachments.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between border border-[#cfd6e2] rounded-[6px] px-3 py-2 bg-slate-50 hover:bg-slate-100/70 transition"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <PaperclipIcon className="h-5 w-5 text-slate-400 shrink-0" />
                                        <div className="min-w-0">
                                            <span className="block truncate text-xs sm:text-sm font-medium text-[#1f2436]">
                                                {item.file_name}
                                            </span>
                                            {item.description && (
                                                <span className="block truncate text-[11px] text-slate-500">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAttachment(item.id)}
                                        className="p-1 rounded hover:bg-red-50 text-[#db3e3e] transition"
                                        aria-label="Hapus lampiran"
                                    >
                                        <TrashIcon className="h-4.5 w-4.5 text-current" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </WorkspaceDialog>
    );
}
