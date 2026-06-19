import { useEffect, useMemo, useState } from 'react';
import { PeriodEndRatesSection } from './PeriodEndSections';
import { buildPeriodYearOptions, getPeriodMonthOptions } from './periodEndShared';
import { createBackendResource, getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import { executeCrudFormAction } from '@/features/workspace/shared/crudFormActions';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';

export default function PeriodEndFormView({
    config,
    activeLevel2Tab,
    onRefresh,
    onOpenContent,
    onOpenDetail,
    backendRows = [],
}) {
    const detailRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const detailRecord = useMemo(() => {
        if (!detailRecordId) return null;
        const found = (backendRows ?? []).find((r) => String(r.id) === String(detailRecordId));
        if (found) return found;
        return (config.detailRecords ?? []).find((record) => String(record.id) === String(detailRecordId)) ?? null;
    }, [backendRows, config.detailRecords, detailRecordId]);

    const monthOptions = useMemo(() => getPeriodMonthOptions(), []);
    const yearOptions = useMemo(() => buildPeriodYearOptions(config), [config]);
    const [month, setMonth] = useState(detailRecord?.month ?? config.defaults?.month ?? monthOptions[0] ?? '');
    const [year, setYear] = useState(detailRecord?.year ?? config.defaults?.year ?? yearOptions[0] ?? '');
    const ratesRows = detailRecord?.rates ?? config.ratesTable.rows;

    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ tone: '', message: '' });
    const isDetail = Boolean(detailRecordId);
    const saveDisabled = isDetail || saving || !month || month === '[Pilih Bulan]';

    useEffect(() => {
        setMonth(detailRecord?.month ?? config.defaults?.month ?? monthOptions[0] ?? '');
        setYear(detailRecord?.year ?? config.defaults?.year ?? yearOptions[0] ?? '');
    }, [config.defaults?.month, config.defaults?.year, detailRecord, monthOptions, yearOptions]);

    async function handleSave() {
        if (!month || month === '[Pilih Bulan]') {
            setStatus({ tone: 'danger', message: 'Bulan harus dipilih.' });
            return;
        }

        await executeCrudFormAction({
            loadingMessage: 'Sedang menyimpan proses akhir bulan.',
            successMessage: 'Proses akhir bulan berhasil dibuat.',
            setSaving,
            setStatus,
            getErrorMessage: getBackendErrorMessage,
            execute: async () => {
                const payload = {
                    document_number: `PE-${year}-${month}`,
                    entry_date: new Date().toISOString().slice(0, 10),
                    notes: `Proses Akhir Bulan (${month}, ${year})`,
                    metadata: {
                        month,
                        year,
                        rates: ratesRows,
                    },
                };
                const response = await createBackendResource('period-ends', payload);
                return { record: response?.data ?? null };
            },
            onSuccess: async ({ record }) => {
                await onRefresh?.();
                if (record?.id) {
                    onOpenDetail?.({
                        recordId: String(record.id),
                        label: record.document_number ?? `PE-${year}-${month}`,
                        tabLabel: record.document_number ?? `PE-${year}-${month}`,
                    });
                }
            },
        });
    }

    return (
        <div className="min-h-full rounded-[6px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <CrudStatusMessage status={status} className="mb-4" />
            <PeriodEndRatesSection
                config={config}
                month={month}
                setMonth={setMonth}
                year={year}
                setYear={setYear}
                monthOptions={monthOptions}
                yearOptions={yearOptions}
                ratesRows={ratesRows}
                onSave={handleSave}
                saveDisabled={saveDisabled}
                saving={saving}
            />
        </div>
    );
}
