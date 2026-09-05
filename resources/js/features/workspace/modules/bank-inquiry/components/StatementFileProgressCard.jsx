import { FileUploadListItemProgressBar } from '@/components/ui/FileUpload';

export default function StatementFileProgressCard({
    file,
    progress = 100,
    parsedData = null,
    loading = false,
    error = '',
    onRemove = null,
    onRetry = null,
}) {
    if (!file) return null;

    return (
        <FileUploadListItemProgressBar
            name={file.name}
            size={file.size}
            type={file.name.split('.').pop()}
            progress={progress}
            failed={Boolean(error)}
            errorMessage={error}
            onDelete={onRemove}
            onRetry={onRetry}
        />
    );
}
