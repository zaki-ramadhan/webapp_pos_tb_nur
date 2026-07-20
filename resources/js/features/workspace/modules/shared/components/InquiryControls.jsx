import TextInput from '@/components/ui/TextInput';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    ColumnsIcon,
    DownloadIcon,
    ExternalLinkIcon,
    IdeaIcon,
    RefreshIcon,
    SearchIcon,
} from '@/features/workspace/shared/Icons';
import SelectField from '@/components/ui/SelectField';
import Button from '@/components/ui/Button';

function resolveActionIcon(action) {
    switch (action.icon) {
        case 'external-link':
            return <ExternalLinkIcon className="h-4.5 w-4.5" />;
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

export function InquiryActionButton({ action, onClick }) {
    const toneClassName =
        action.tone === 'warning'
            ? 'border-transparent bg-warning text-white hover:bg-warning'
            : 'border-brand-blue-border bg-white text-brand-blue hover:bg-bg-brand-blue-toggled';

    return (
        <Button
            aria-label={action.label}
            title={action.label}
            onClick={onClick}
            variant="secondary"
            size="sm"
            className={`h-[40px] min-w-[40px] px-3 font-normal active:scale-[0.98] focus:outline-none ${toneClassName}`.trim()}
        >
            {resolveActionIcon(action)}
        </Button>
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
        return (
            <AccountLookupTextInput
                id={control.id}
                value={value}
                placeholder={control.placeholder ?? 'Cari/Pilih...'}
                searchLabel="Cari kas/bank"
                dialogTitle="Pilih Kas/Bank"
                queryParams={{ account_type: 'Cash/Bank' }}
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                inputClassName="text-sm text-brand-dark py-1 h-full"
                trailingClassName="w-[32px] shrink-0 justify-center px-0 h-full"
                onSelectAccount={(record, label) => {
                    onChange(control.id, label);
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
