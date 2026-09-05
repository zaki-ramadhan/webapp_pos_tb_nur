import { openSourceDocument } from '@/features/workspace/backend/adapters/bankAdapters';

export function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [y, m, d] = str.split('-');
        return `${d}/${m}/${y}`;
    }
    return str;
}

export function cleanAccountDescription(desc) {
    if (!desc) return '';
    return String(desc)
        .replace(/\[.*?\]\s*/g, '')
        .replace(/\(\d+([.-]\d+)*\)\s*/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

export default function JurnalCard({ row }) {
    const debitNum = row.debit ? (parseFloat(String(row.debit).replace(/\./g, '').replace(/,/g, '.')) || 0) : 0;
    const creditNum = row.credit ? (parseFloat(String(row.credit).replace(/\./g, '').replace(/,/g, '.')) || 0) : 0;

    const isDebit = debitNum > 0;
    const num = isDebit ? debitNum : creditNum;
    const formattedAmount = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(num);
    const typeLabel = isDebit ? '(Dr)' : '(Cr)';
    const displayDate = formatDisplayDate(row.date);
    const isClickable = Boolean(row.document_id && row.document_type);
    const docNumber = row.documentNumber || row.sourceNumber || row.document_number;
    const rawDesc = row.description || row.transactionType || row.transaction_type;
    const displayDesc = cleanAccountDescription(rawDesc);

    return (
        <div
            onClick={isClickable ? () => openSourceDocument(row) : undefined}
            className={`border border-[#72b1cb] rounded-[4px] overflow-hidden flex flex-col justify-between min-h-[96px] h-full shadow-xs ${
                isClickable ? 'cursor-pointer transition hover:brightness-[0.98]' : ''
            }`.trim()}
        >
            <div className="bg-[#D3F4FF] px-3.5 pt-2 pb-1.5 flex-1 flex flex-col justify-start">
                <div className="flex justify-between items-start text-sm text-slate-900 gap-2">
                    <span className="font-normal">{displayDate}</span>
                    <span className="font-semibold text-base text-slate-900 whitespace-nowrap">
                        {typeLabel} {formattedAmount}
                    </span>
                </div>
                <div className="text-sm font-normal text-slate-900 leading-snug text-left mt-0.5 line-clamp-2">
                    {displayDesc}
                </div>
            </div>
            <div className="bg-[#F4FCFF] px-3.5 py-1.5">
                <div className={`text-sm text-left ${isClickable ? 'text-brand-blue font-normal hover:underline' : 'text-slate-900 font-normal'}`}>
                    {docNumber}
                </div>
            </div>
        </div>
    );
}
