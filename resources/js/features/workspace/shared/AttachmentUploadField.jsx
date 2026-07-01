import { useState } from 'react';
import { uploadBackendAttachment } from '@/features/workspace/backend/workspaceBackendApi';
import { PaperclipIcon, CloseIcon, PlusIcon } from './Icons';

export default function AttachmentUploadField({
    value = [],
    onChange,
    label = 'Unggah Berkas',
    accept = 'image/*',
    multiple = false,
    maxSizeMb = 3,
    maxFiles = 5,
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    async function handleFileChange(event) {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        setError('');

        const currentList = Array.isArray(value) ? value : [];
        if (multiple && currentList.length + files.length > maxFiles) {
            setError(`Maksimal berkas yang diperbolehkan adalah ${maxFiles} foto.`);
            return;
        }

        // Validate format
        if (accept.startsWith('image/')) {
            const invalidFormat = files.find((file) => !file.type.startsWith('image/'));
            if (invalidFormat) {
                setError('Hanya berkas gambar (JPG, JPEG, PNG, WEBP, GIF) yang diperbolehkan.');
                return;
            }
        }

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
                {currentList.map((item, index) => {
                    const isImage = item.file_type?.startsWith('image/');
                    return (
                        <div
                            key={item.id}
                            className={`group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[8px] bg-ui-bg-hover transition ${
                                index === 0
                                    ? 'border-2 border-blue-900 shadow-md ring-2 ring-blue-900/10'
                                    : 'border border-ui-border shadow-sm hover:border-google-blue'
                            }`}
                        >
                            {index === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-blue-900 py-0.5 text-center text-[9px] font-bold tracking-wider text-white select-none z-10 uppercase">
                                    UTAMA
                                </div>
                            )}
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
                                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white shadow-md transition hover:bg-red-700 active:scale-95 z-20"
                                aria-label="Hapus lampiran"
                            >
                                <CloseIcon className="h-3.5 w-3.5" strokeWidth={2.6} />
                            </button>
                        </div>
                    );
                })}

                {(!multiple && currentList.length > 0) || currentList.length >= maxFiles ? null : (
                    <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-ui-border bg-white transition hover:border-input-brand hover:bg-ui-bg-hover">
                        {uploading ? (
                            <svg className="animate-spin h-6 w-6 text-input-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
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
