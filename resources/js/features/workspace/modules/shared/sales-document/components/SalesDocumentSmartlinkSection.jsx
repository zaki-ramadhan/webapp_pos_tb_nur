import { TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function SalesDocumentSmartlinkSection() {
    return (
        <div className="rounded-[6px] border border-ui-border-medium bg-white p-5">
            <TransactionSectionHeading title="SmartLink" icon="smartlink" />
            <p className="mt-4 max-w-[760px] text-base leading-7 text-text-workspace-muted">
                Dokumen ini belum memiliki SmartLink aktif. Hubungkan dokumen lain atau aktifkan integrasi
                untuk menampilkan referensi otomatis di area ini.
            </p>
        </div>
    );
}
