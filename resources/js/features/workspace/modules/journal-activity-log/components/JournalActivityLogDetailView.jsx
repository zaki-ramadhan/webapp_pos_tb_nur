import SectionTab from '@/features/workspace/shared/SectionTab';

function formatAmount(val) {
    const num = Number(val ?? 0);
    if (!num || isNaN(num)) return '';
    return num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function buildDetailFromRecord(row, config) {
    const record = row?.__backendRecord ?? {};
    const payload = record.after_payload ?? record.before_payload ?? {};
    const lines = payload.lines ?? record.metadata?.lines ?? [];

    let entries = [];
    let totalDebitNum = 0;
    let totalCreditNum = 0;

    if (Array.isArray(lines) && lines.length > 0) {
        entries = lines.map((line, idx) => {
            const code = line.account?.code ?? line.account_code ?? line.reference_code ?? line.code ?? `110${idx + 1}`;
            const name = line.account?.name ?? line.account_name ?? line.description ?? `Akun ${idx + 1}`;
            const debitVal = Number(line.debit_amount ?? line.debit ?? (line.line_type === 'debit' ? line.total_amount : 0));
            const creditVal = Number(line.credit_amount ?? line.credit ?? (line.line_type === 'credit' ? line.total_amount : 0));

            totalDebitNum += debitVal;
            totalCreditNum += creditVal;

            return {
                id: line.id ?? `line-${idx + 1}`,
                accountCode: code,
                accountName: name,
                debit: debitVal > 0 ? formatAmount(debitVal) : '',
                credit: creditVal > 0 ? formatAmount(creditVal) : '',
            };
        });
    } else {
        const rawAmount = Number(record.total_amount ?? record.metadata?.amount ?? row?.amount ?? 8000000);
        const amountNum = isNaN(rawAmount) || rawAmount === 0 ? 8000000 : rawAmount;

        entries = [
            {
                id: `${row?.id ?? '1'}-line-1`,
                accountCode: '110102',
                accountName: 'Bank',
                debit: formatAmount(amountNum),
                credit: '',
            },
            {
                id: `${row?.id ?? '1'}-line-2`,
                accountCode: '110101',
                accountName: 'Kas Kecil',
                debit: '',
                credit: formatAmount(amountNum),
            },
        ];
        totalDebitNum = amountNum;
        totalCreditNum = amountNum;
    }

    const actorName = record.actor_name ?? row?.actorName ?? 'Zaki Ramadhan';
    const dateStr = row?.date ?? '06 Jul 2026';
    const occurredTime = record.occurred_at
        ? new Date(record.occurred_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '07:43:51';

    return {
        documentNumber: row?.number ?? record.metadata?.jv_number ?? 'JV.2026.07.00008',
        transactionNumber: record.document_number ?? row?.transactionNumber ?? 'BT.2026.07.00001',
        date: dateStr,
        transactionType: row?.typeLabel ?? 'Transfer Bank',
        reviewedAt: `Per ${dateStr} ${occurredTime} (Aktif)`,
        reviewer: `Pengguna : ${actorName}`,
        entries,
        totalDebit: formatAmount(totalDebitNum),
        totalCredit: formatAmount(totalCreditNum),
    };
}

export default function JournalActivityLogDetailView({ config, activeLevel2Tab }) {
    const recordId = activeLevel2Tab?.recordId;
    const row = config.rowMap?.[recordId];
    const detail = config.detailRecords?.[recordId] ?? buildDetailFromRecord(row, config);

    return (
        <div className="flex min-h-full flex-col">
            <div className="px-1 pt-0.5">
                <SectionTab label={config.sectionLabel ?? 'Pemeriksaan'} />
            </div>

            <div className="flex min-h-full flex-col rounded-[6px] border border-ui-border-medium bg-white px-5 py-4 shadow-card-light">
                {/* Top Info Grid: Left (Tanggal & Tipe Transaksi), Right (Nomor # & No. Trans #) */}
                <div className="grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-12 max-w-4xl pb-4">
                    {/* Left Side */}
                    <div className="space-y-2.5">
                        <div className="grid grid-cols-[140px_1fr] items-center text-sm sm:text-base text-text-darkest font-normal">
                            <span>Tanggal</span>
                            <span>{detail.date}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] items-center text-sm sm:text-base text-text-darkest font-normal">
                            <span>Tipe Transaksi</span>
                            <span>{detail.transactionType}</span>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-2.5">
                        <div className="grid grid-cols-[140px_1fr] items-center text-sm sm:text-base text-text-darkest font-normal">
                            <span>Nomor #</span>
                            <span>{detail.documentNumber}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] items-center text-sm sm:text-base text-text-darkest font-normal">
                            <span>No. Trans #</span>
                            <span>{detail.transactionNumber}</span>
                        </div>
                    </div>
                </div>

                {/* Table Header: Font Normal */}
                <div className="mt-2 border-t border-b border-gray-300 bg-[#d9d9d9] px-4 py-2.5">
                    <div className="grid grid-cols-[160px_1fr_200px_200px] gap-x-4 font-normal text-sm sm:text-base text-text-darkest">
                        <div>Akun Perkiraan</div>
                        <div>Nama Perkiraan</div>
                        <div className="text-right">Debit</div>
                        <div className="text-right">Kredit</div>
                    </div>
                </div>

                {/* Entries List & Totals */}
                <div className="px-4 py-3">
                    <div className="font-semibold text-sm sm:text-base text-text-darkest">{detail.reviewedAt}</div>
                    <div className="mt-1 text-sm sm:text-base text-text-darkest">{detail.reviewer}</div>

                    <div className="mt-4 space-y-2.5">
                        {detail.entries.map((entry) => (
                            <div key={entry.id} className="grid grid-cols-[160px_1fr_200px_200px] gap-x-4 text-sm sm:text-base text-text-darkest">
                                <div>{entry.accountCode}</div>
                                <div>{entry.accountName}</div>
                                <div className="text-right font-normal">{entry.debit}</div>
                                <div className="text-right font-normal">{entry.credit}</div>
                            </div>
                        ))}
                    </div>

                    {/* Totals Summary */}
                    <div className="mt-5 grid grid-cols-[160px_1fr_200px_200px] gap-x-4 text-sm sm:text-base">
                        <div />
                        <div />
                        <div className="text-right">
                            <div className="ml-auto h-px w-full bg-gray-500 mb-1.5" />
                            <div className="font-bold text-text-darkest">{detail.totalDebit}</div>
                        </div>
                        <div className="text-right">
                            <div className="ml-auto h-px w-full bg-gray-500 mb-1.5" />
                            <div className="font-bold text-text-darkest">{detail.totalCredit}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
