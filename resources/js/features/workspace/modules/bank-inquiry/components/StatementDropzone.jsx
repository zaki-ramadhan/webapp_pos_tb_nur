import { FileUploadDropZone } from '@/components/ui/FileUpload';

export default function StatementDropzone({ onFileSelect, disabled = false }) {
    const handleDropFiles = (files) => {
        if (files && files[0]) {
            onFileSelect?.(files[0]);
        }
    };

    return (
        <FileUploadDropZone
            onDropFiles={handleDropFiles}
            isDisabled={disabled}
            accept=".csv,.xlsx,.xls"
            maxSizeText="CSV, XLSX, atau XLS (maks. 10MB)"
        />
    );
}
