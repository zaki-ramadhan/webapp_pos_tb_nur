import { useState, useMemo } from 'react';
import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function SmartlinkEbankingTableView({
    table,
    onCreate,
    onOpenDetail,
    onRefresh,
}) {
    const resolvedTable = useMemo(() => ({
        ...table,
        onRefresh,
    }), [table, onRefresh]);

    return (
        <ModuleTableTemplate
            table={resolvedTable}
            resourceName="smartlink-bank"
            exportFilename="daftar-akun-smartlink-ebanking"
            exportTitle="Daftar Akun SmartLink e-Banking"
            onCreate={onCreate}
            onOpenDetail={onOpenDetail}
            disableImport
            disableExport
            disablePrint
        />
    );
}
