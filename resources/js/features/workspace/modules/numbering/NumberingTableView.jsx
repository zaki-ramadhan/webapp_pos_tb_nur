import ModuleTableTemplate from '@/components/ui/ModuleTableTemplate';

export default function NumberingTableView({ table, onCreate }) {
    return (
        <ModuleTableTemplate
            table={table}
            resourceName="numbering-sequences"
            exportFilename="penomoran"
            exportTitle="Laporan Penomoran"
            inactiveFilterKey="transactionTypeValue"
            onCreate={onCreate}
        />
    );
}

