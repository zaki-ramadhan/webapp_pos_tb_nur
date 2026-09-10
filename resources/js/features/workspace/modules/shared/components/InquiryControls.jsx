import TextInput from '@/components/ui/TextInput';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { getSmartlinkAccounts } from '@/features/workspace/modules/smartlink-ebanking/smartlinkStore';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import RefreshButton from '@/features/workspace/shared/RefreshButton';
import {
    ColumnsIcon,
    DownloadIcon,
    ExportIcon,
    ExternalLinkIcon,
    IdeaIcon,
    RefreshIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';
import SelectField from '@/components/ui/SelectField';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';

function resolveActionIcon(action) {
    switch (action.icon) {
        case 'external-link':
            return <ExternalLinkIcon className="h-4.5 w-4.5" />;
        case 'export':
        case 'export-excel':
            return <ExportIcon className="h-4.5 w-4.5" />;
        case 'idea':
            return <IdeaIcon className="h-4.5 w-4.5" />;
        case 'transfer':
            return <NavigationIcon type="transfer" className="h-4.5 w-4.5 text-current" />;
        case 'download':
            return <DownloadIcon className="h-4.5 w-4.5" />;
        case 'columns':
            return <ColumnsIcon className="h-4.5 w-4.5" />;
        case 'link':
        default:
            return <RefreshIcon className="h-4.5 w-4.5" />;
    }
}

export function InquiryActionButton({ action, onClick, loading = false }) {
    const isReloadAction = action.id === 'reload' || action.id === 'refresh';

    if (isReloadAction) {
        return (
            <RefreshButton
                label="Muat ulang"
                onClick={onClick}
                loading={loading || action.loading}
            />
        );
    }

    const toneClassName =
        action.tone === 'warning'
            ? 'border-transparent bg-warning text-white hover:bg-warning'
            : 'border-brand-blue-border bg-white text-brand-blue hover:bg-bg-brand-blue-toggled';

    return (
        <Tooltip content={action.label} portal>
            <Button
                aria-label={action.label}
                onClick={onClick}
                variant="secondary"
                size="sm"
                className={`h-[40px] min-w-[40px] px-3 font-normal active:scale-[0.98] focus:outline-none ${toneClassName}`.trim()}
            >
                {resolveActionIcon(action)}
            </Button>
        </Tooltip>
    );
}

export function InquiryControl({ control, value, onChange }) {
    if (control.type === 'select') {
        return (
            <SelectField
                value={value}
                onChange={(event) => onChange(control.id, event.target.value)}
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                selectClassName="text-sm text-brand-dark sm:text-xs sm:text-sm"
            >
                {(control.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </SelectField>
        );
    }

    if (control.type === 'label') {
        return <span className={`text-sm text-text-darkest sm:text-base ${control.className ?? ''}`.trim()}>{control.label}</span>;
    }

    if (control.type === 'date') {
        return (
            <TransactionDateInput
                value={value}
                onChange={(nextValue) => onChange(control.id, nextValue)}
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                inputClassName="text-sm text-brand-dark py-1 h-full"
                trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
            />
        );
    }

    if (control.type === 'search') {
        const isSmartlink = control.lookupType === 'smartlink-bank';

        return (
            <AccountLookupTextInput
                id={control.id}
                value={value}
                placeholder={control.placeholder ?? 'Cari/Pilih...'}
                searchLabel="Cari kas/bank"
                dialogTitle="Pilih Kas/Bank"
                queryParams={{ account_type: 'Cash/Bank' }}
                filterRows={
                    isSmartlink
                        ? (record) => {
                              const smartAccounts = getSmartlinkAccounts();
                              return smartAccounts.some((acc) => {
                                  const relName = String(acc.accountRelation || acc.accountName || '').trim().toLowerCase();
                                  const recName = String(record.name || '').trim().toLowerCase();
                                  return (
                                      (acc.accountId && String(acc.accountId) === String(record.id)) ||
                                      (acc.accountId && String(acc.accountId) === String(record.code)) ||
                                      (relName && relName === recName)
                                  );
                              });
                          }
                        : null
                }
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                inputClassName="text-sm text-brand-dark py-1 h-full"
                trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
                onSelectAccount={(record, label) => {
                    let nextLabel = label;
                    if (isSmartlink && record) {
                        const smartAccounts = getSmartlinkAccounts();
                        const relName = String(record.name || '').trim().toLowerCase();
                        const matched = smartAccounts.find(
                            (acc) =>
                                (acc.accountId && String(acc.accountId) === String(record.id)) ||
                                (acc.accountId && String(acc.accountId) === String(record.code)) ||
                                (acc.accountRelation && String(acc.accountRelation).toLowerCase() === relName) ||
                                (acc.accountName && String(acc.accountName).toLowerCase() === relName)
                        );
                        if (matched) {
                            const serviceType = matched.serviceType || record.name;
                            const servicePrefix = serviceType.includes('(') ? serviceType.split('(')[0].trim() : serviceType;
                            nextLabel = `[${servicePrefix}] ${serviceType} #${matched.accountNumber}`;
                        } else {
                            const accNum = record.account_number || record.code || '';
                            nextLabel = accNum ? `${record.name} #${accNum}` : record.name;
                        }
                    }
                    onChange(control.id, nextLabel, record ? { account_id: record.id } : { account_id: '' });
                }}
            />
        );
    }

    return (
        <TextInput
            value={value}
            onChange={(event) => onChange(control.id, event.target.value)}
            placeholder={control.placeholder ?? ''}
            trailing={<SearchIcon className="h-5 w-5 text-text-darkest" />}
            className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
            inputClassName="text-sm text-brand-dark sm:text-xs sm:text-sm"
            trailingClassName="px-3"
        />
    );
}
