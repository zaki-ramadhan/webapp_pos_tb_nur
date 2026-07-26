import { getBackendResource, listBackendResource, extractBackendRows } from '@/features/workspace/backend/workspaceBackendApi';
import { formatCurrencyValue } from '@/features/workspace/shared/transactionFormatters';
import { applyCashPaymentLineItems } from './cashPaymentShared';
import { showLoadingToast, updateToastToSuccess, updateToastToError } from '@/components/feedback/toast';

export async function processExpenseEntriesImport(selectedRecords, setValues, setStatus) {
    try {
        let allImportedLines = [];
        let appendedNotes = [];

        for (const record of selectedRecords) {
            const fullRecord = (record.lines && record.lines.length > 0)
                ? record
                : await getBackendResource('expense-entries', record.id);
            
            if (!fullRecord) continue;
            const liabilityAccount = fullRecord.primary_account;
            const importedLine = {
                id: `imported-expense-line-${fullRecord.id}-${Date.now()}-${Math.random()}`,
                __lineId: null,
                __accountId: liabilityAccount?.id ?? fullRecord.primary_account_id ?? null,
                accountCode: liabilityAccount?.code ?? '',
                accountName: liabilityAccount?.name ?? 'Utang Beban',
                amount: formatCurrencyValue(fullRecord.total_amount ?? 0),
            };

            allImportedLines.push(importedLine);
            if (fullRecord.notes?.trim()) {
                appendedNotes.push(fullRecord.notes.trim());
            }
        }

        if (allImportedLines.length === 0) {
            setStatus({
                tone: 'error',
                message: 'Tidak ada rincian beban yang diimpor.',
            });
            return;
        }

        setValues((current) => {
            const combinedNotes = [current.notes?.trim(), ...appendedNotes]
                .filter(Boolean)
                .join('\n');
            
            return applyCashPaymentLineItems(
                {
                    ...current,
                    __relatedDocumentId: selectedRecords[0]?.id ?? null,
                    lineItems: [...(current.lineItems ?? []), ...allImportedLines],
                    notes: combinedNotes,
                },
                [...(current.lineItems ?? []), ...allImportedLines],
            );
        });

        setStatus({
            tone: 'success',
            message: `Berhasil mengambil rincian dari ${selectedRecords.map((r) => r.document_number).join(', ')}.`,
        });
    } catch (err) {
        setStatus({
            tone: 'error',
            message: 'Gagal mengambil rincian pencatatan beban.',
        });
    }
}

export async function processPayrollEntriesImport(selectedRecords, setValues, setStatus) {
    try {
        let allImportedLines = [];
        let appendedNotes = [];

        for (const record of selectedRecords) {
            const fullRecord = (record.primary_account)
                ? record
                : await getBackendResource('payroll-entries', record.id);
            
            if (!fullRecord) continue;
            
            const liabilityAccount = fullRecord.primary_account;
            const metadata = fullRecord.metadata ?? {};
            const label = metadata.liability_accounts?.[0] ?? '';
            const match = label.match(/^\[([^\]]+)\]\s*(.+)$/);
            let accountCode = '';
            let accountName = 'Hutang Beban - Gaji';
            if (match) {
                accountCode = match[1];
                accountName = `${match[2]} - Gaji`;
            }

            let accountId = liabilityAccount?.id ?? fullRecord.primary_account_id ?? metadata.liability_account_id ?? null;
            if (!accountId && accountCode) {
                try {
                    const accountsData = await listBackendResource('accounts', { search: accountCode });
                    const accounts = extractBackendRows(accountsData);
                    const foundAccount = accounts.find(acc => acc.code === accountCode);
                    if (foundAccount) {
                        accountId = foundAccount.id;
                    }
                } catch {
                    /* ignore account search error */
                }
            }

            const importedLine = {
                id: `imported-payroll-line-${fullRecord.id}-${Date.now()}-${Math.random()}`,
                __lineId: null,
                __accountId: accountId,
                accountCode: liabilityAccount?.code ?? accountCode,
                accountName: liabilityAccount?.name ?? accountName,
                amount: formatCurrencyValue(fullRecord.total_amount ?? 0),
            };

            allImportedLines.push(importedLine);
            if (fullRecord.notes?.trim()) {
                appendedNotes.push(fullRecord.notes.trim());
            }
        }

        if (allImportedLines.length === 0) {
            setStatus({
                tone: 'error',
                message: 'Tidak ada rincian pencatatan gaji yang diimpor.',
            });
            return;
        }

        setValues((current) => {
            const combinedNotes = [current.notes?.trim(), ...appendedNotes]
                .filter(Boolean)
                .join('\n');

            return applyCashPaymentLineItems(
                {
                    ...current,
                    __relatedDocumentId: selectedRecords[0]?.id ?? null,
                    lineItems: [...(current.lineItems ?? []), ...allImportedLines],
                    notes: combinedNotes,
                },
                [...(current.lineItems ?? []), ...allImportedLines],
            );
        });

        setStatus({
            tone: 'success',
            message: `Berhasil mengambil rincian dari ${selectedRecords.map((r) => r.number).join(', ')}.`,
        });
    } catch (err) {
        setStatus({
            tone: 'error',
            message: 'Gagal mengambil rincian pencatatan gaji.',
        });
    }
}
