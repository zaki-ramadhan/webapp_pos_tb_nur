import { useEffect, useMemo, useState } from 'react';

import { PeriodEndRatesSection } from './PeriodEndSections';
import { buildPeriodYearOptions, getPeriodMonthOptions } from './periodEndShared';

export default function PeriodEndFormView({ config, activeLevel2Tab }) {
    const detailRecordId = activeLevel2Tab?.tabType === 'detail' ? activeLevel2Tab.recordId : null;
    const detailRecord = useMemo(
        () => (config.detailRecords ?? []).find((record) => record.id === detailRecordId) ?? null,
        [config.detailRecords, detailRecordId],
    );
    const monthOptions = useMemo(() => getPeriodMonthOptions(), []);
    const yearOptions = useMemo(() => buildPeriodYearOptions(config), [config]);
    const [month, setMonth] = useState(detailRecord?.month ?? config.defaults?.month ?? monthOptions[0] ?? '');
    const [year, setYear] = useState(detailRecord?.year ?? config.defaults?.year ?? yearOptions[0] ?? '');
    const ratesRows = detailRecord?.rates ?? config.ratesTable.rows;

    useEffect(() => {
        setMonth(detailRecord?.month ?? config.defaults?.month ?? monthOptions[0] ?? '');
        setYear(detailRecord?.year ?? config.defaults?.year ?? yearOptions[0] ?? '');
    }, [config.defaults?.month, config.defaults?.year, detailRecord, monthOptions, yearOptions]);

    return (
        <div className="min-h-full rounded-[6px] border border-[#cfd6e2] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
            <PeriodEndRatesSection
                config={config}
                month={month}
                setMonth={setMonth}
                year={year}
                setYear={setYear}
                monthOptions={monthOptions}
                yearOptions={yearOptions}
                ratesRows={ratesRows}
            />
        </div>
    );
}
