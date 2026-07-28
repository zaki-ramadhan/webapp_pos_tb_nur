export function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [y, m, d] = str.split('-');
        return `${d}/${m}/${y}`;
    }
    return str;
}

export default function JurnalCard({ row }) {
    const debitNum = row.debit ? (parseFloat(String(row.debit).replace(/\./g, '').replace(/,/g, '.')) || 0) : 0;
    const creditNum = row.credit ? (parseFloat(String(row.credit).replace(/\./g, '').replace(/,/g, '.')) || 0) : 0;

    const isDebit = debitNum > 0;
    const num = isDebit ? debitNum : creditNum;
    const formattedAmount = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(num);
    const typeLabel = isDebit ? '(Debit)' : '(Kredit)';
    const displayDate = formatDisplayDate(row.date);

    return (
        <div className="border border-[#a8d4e7] rounded-[4px] bg-[#eef7fc] overflow-hidden flex flex-col justify-between min-h-[110px] h-full shadow-xs">
            <div className="p-3 flex-1 flex flex-col gap-1 bg-[#eef7fc]">
                <div className="flex justify-between items-center text-sm font-normal text-slate-900">
                    <span>{displayDate}</span>
                    <span className="font-semibold text-slate-900 text-sm">
                        {typeLabel} {formattedAmount}
                    </span>
                </div>
                <div className="text-sm font-normal text-slate-900 leading-snug text-left mt-0.5">
                    {row.description || row.transactionType || row.transaction_type}
                </div>
                {row.description && row.transactionType && row.description !== row.transactionType && (
                    <div className="text-sm font-normal text-slate-900 text-left" title={row.transactionType}>
                        {row.transactionType}
                    </div>
                )}
            </div>
            <div className="bg-[#e1f1f9] px-3 py-2 text-sm font-normal text-slate-900 border-t border-[#bcdfe8] text-left">
                {row.documentNumber || row.sourceNumber || row.document_number}
            </div>
        </div>
    );
}
