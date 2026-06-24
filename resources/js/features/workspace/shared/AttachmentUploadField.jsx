import { useState } from 'react';
import { uploadBackendAttachment } from '@/features/workspace/backend/workspaceBackendApi';
import { PaperclipIcon, CloseIcon, PlusIcon } from './Icons';

export default function AttachmentUploadField({
    value = [],
    onChange,
    label = 'Unggah Berkas',
    accept = 'image/*',
    multiple = false,
    maxSizeMb = 10,
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    async function handleFileChange(event) {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        setError('');

        const oversizedFile = files.find((file) => file.size > maxSizeMb * 1024 * 1024);
        if (oversizedFile) {
            setError(`Ukuran berkas melebihi batas maksimal ${maxSizeMb} MB.`);
            return;
        }

        setUploading(true);
        try {
            const uploadedAttachments = [];
            for (const file of files) {
                const attachment = await uploadBackendAttachment(file);
                if (attachment) {
                    uploadedAttachments.push(attachment);
                }
            }

            const currentList = Array.isArray(value) ? value : [];
            const newList = multiple ? [...currentList, ...uploadedAttachments] : uploadedAttachments;
            onChange(newList);
        } catch (err) {
            setError(err?.response?.data?.message ?? 'Gagal mengunggah berkas.');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    }

    function removeAttachment(attachmentId) {
        const currentList = Array.isArray(value) ? value : [];
        const newList = currentList.filter((item) => item.id !== attachmentId);
        onChange(newList);
    }

    const currentList = Array.isArray(value) ? value : [];

    return (
        <div className="space-y-3">
            {label && (
                <span className="block text-base font-medium text-layout-text">
                    {label}
                </span>
            )}

            <div className="flex flex-wrap gap-3">
                {currentList.map((item) => {
                    const isImage = item.file_type?.startsWith('image/');
                    return (
                        <div
                            key={item.id}
                            className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[8px] border border-ui-border bg-ui-bg-hover shadow-sm transition hover:border-google-blue"
                        >
                            {isImage ? (
                                <img
                                    src={item.url}
                                    alt={item.file_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center p-2 text-center">
                                    <PaperclipIcon className="h-6 w-6 text-text-muted" />
                                    <span className="mt-1 block max-w-full truncate text-xs text-blue-550">
                                        {item.file_name}
                                    </span>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => removeAttachment(item.id)}
                                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                                aria-label="Hapus lampiran"
                            >
                                <CloseIcon className="h-3 w-3" strokeWidth={2.5} />
                            </button>
                        </div>
                    );
                })}

                {(!multiple && currentList.length > 0) ? null : (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-ui-border bg-white transition hover:border-input-brand hover:bg-ui-bg-hover">
                        {uploading ? (
                            <span className="text-xs text-layout-text animate-pulse">
                                Mengunggah...
                            </span>
                        ) : (
                            <>
                                <PlusIcon className="h-6 w-6 text-text-muted" />
                                <span className="mt-1 block text-xs font-medium text-text-muted">
                                    Pilih File
                                </span>
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept={accept}
                            multiple={multiple}
                            disabled={uploading}
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-700">
                    {error}
                </p>
            )}
        </div>
    );
}
