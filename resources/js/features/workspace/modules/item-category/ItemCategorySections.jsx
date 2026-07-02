import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import { CloseIcon } from '@/features/workspace/shared/Icons';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';

function ItemCategoryFieldRow({ label, required = false, children, className = '' }) {
    return (
        <div className={`grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
            <label className="pt-2 text-xs sm:text-sm leading-6 text-brand-dark">
                {label}
                {required ? <span className="text-tab-active-border-t"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function ClearableTextInput({ value, onChange, className = '' }) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            className={`h-[40px] rounded-[4px] border-ui-border ${className}`.trim()}
            inputClassName="text-xs sm:text-sm text-brand-dark"
            trailing={
                value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-text-darkest transition hover:bg-bg-workspace-light"
                        aria-label="Kosongkan nama kategori"
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null
            }
            trailingClassName={value ? 'pr-2' : ''}
        />
    );
}

export function ItemCategoryGeneralTab({ config, values, onChange, parentCategoryOptions = [] }) {
    return (
        <div className="space-y-4">
            <ItemCategoryFieldRow label={config.labels.name} required>
                <ClearableTextInput value={values.name} onChange={(event) => onChange('name', event.target.value)} className="max-w-[420px]" />
            </ItemCategoryFieldRow>

            <ItemCategoryFieldRow label={config.labels.isDefault}>
                <CheckboxField
                    id="item-category-default"
                    label={config.labels.yes}
                    checked={values.isDefault}
                    onChange={(event) => onChange('isDefault', event.target.checked)}
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </ItemCategoryFieldRow>

            <ItemCategoryFieldRow
                label={
                    <CheckboxField
                        id="item-category-subcategory"
                        label={config.labels.isSubCategory}
                        checked={values.isSubCategory}
                        onChange={(event) => {
                            onChange('isSubCategory', event.target.checked);
                            if (!event.target.checked) {
                                onChange('parentId', '');
                                onChange('parentName', '');
                            }
                        }}
                        align="center"
                        labelClassName="text-xs sm:text-sm font-normal text-brand-dark cursor-pointer"
                        inputClassName="mt-0 h-[18px] w-[18px]"
                        containerClassName="w-auto inline-flex"
                    />
                }
            >
                {values.isSubCategory ? (
                    <ReferenceLookupInput
                        value={values.parentName}
                        items={parentCategoryOptions}
                        onSelect={(item) => {
                            onChange('parentId', item.id);
                            onChange('parentName', item.name);
                        }}
                        onClear={() => {
                            onChange('parentId', '');
                            onChange('parentName', '');
                        }}
                        placeholder="Cari/Pilih Kategori Induk..."
                        searchLabel="Cari kategori"
                        className="w-full max-w-[420px]"
                        getOptionLabel={(option) => option.name}
                        getOptionSearchText={(option) => option.name}
                        renderOption={(option) => (
                            <div className="text-xs sm:text-sm font-medium text-text-workspace-dark">
                                {option.name}
                            </div>
                        )}
                    />
                ) : null}
            </ItemCategoryFieldRow>
        </div>
    );
}

const ACCOUNT_TYPE_MAP = {
    inventoryAccount: 'Inventory',
    expenseAccount: ['Expense', 'Other Expense'],
    salesAccount: 'Revenue',
    salesReturnAccount: 'Revenue',
    salesDiscountAccount: 'Revenue',
    goodsInTransitAccount: ['Inventory', 'Other Current Asset'],
    costOfGoodsSoldAccount: 'Cost of Sales',
    purchaseReturnAccount: ['Inventory', 'Cost of Sales'],
    unbilledPurchaseAccount: ['Payable', 'Other Current Liability'],
};

export function ItemCategoryAccountsTab({ config, values, onAccountChange }) {
    return (
        <div className="max-w-[1180px] space-y-4">
            <p className="pt-1 text-xs sm:text-sm italic leading-6 text-brand-dark">{config.accountIntro}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 max-w-[980px]">
                {config.accountFields.map((field) => (
                    <ItemCategoryFieldRow key={field.id} label={field.label}>
                        <AccountLookupField
                            value={values.accounts[field.id] ?? ''}
                            placeholder={config.accountPlaceholder}
                            searchLabel={`Cari ${field.label}`}
                            onRemove={() => onAccountChange(field.id, '', '')}
                            onSelectAccount={(record, label) => onAccountChange(field.id, label, record?.id ?? '')}
                            dialogTitle={`Pilih ${field.label}`}
                            queryParams={{ account_type: ACCOUNT_TYPE_MAP[field.id] }}
                        />
                    </ItemCategoryFieldRow>
                ))}
            </div>

            <div className="flex items-start gap-3 pt-1">
                <span className="mt-0.5 h-6 w-[4px] shrink-0 rounded-full bg-bg-timeline-bar-gray" />
                <p className="text-sm italic leading-6 text-red-550">{config.accountNote}</p>
            </div>
        </div>
    );
}
