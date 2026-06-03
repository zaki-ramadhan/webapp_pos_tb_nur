import ChipLookupField from '@/features/workspace/shared/ChipLookupField';

import useAccountLookupController, {
    buildAccountLookupLabel,
    buildAccountLookupMeta,
} from './hooks/useAccountLookupController';

import AccountLookupSearchInput from './components/AccountLookupSearchInput';
import AccountLookupSuggestions from './components/AccountLookupSuggestions';

export {
    buildAccountLookupLabel,
    buildAccountLookupMeta,
};

function normalizeInputValue(value) {
    return String(value ?? '');
}

export function AccountLookupField({
    value = '',
    values = null,
    placeholder = 'Cari/Pilih Akun Perkiraan...',
    searchLabel = 'Cari akun perkiraan',
    dialogTitle = 'Pilih Akun Perkiraan',
    disabled = false,
    className = '',
    contentClassName = '',
    chipClassName = '',
    heightClassName = 'h-[40px]',
    onRemove = null,
    onSelectAccount = null,
}) {
    const controller = useAccountLookupController({ value, values, disabled });
    const isMultiValue = Array.isArray(values);

    return (
        <div ref={controller.rootRef} className="relative">
            {isMultiValue ? (
                <ChipLookupField
                    value={value}
                    values={values}
                    placeholder={placeholder}
                    searchLabel={searchLabel}
                    onRemove={onRemove}
                    onSearch={disabled ? null : () => controller.openLookup('')}
                    disabled={disabled}
                    className={className}
                    contentClassName={contentClassName}
                    chipClassName={chipClassName}
                    heightClassName={heightClassName}
                    searching={controller.loading && controller.open}
                />
            ) : (
                <AccountLookupSearchInput
                    value={controller.draftValue}
                    selectedValue={controller.selectedValue}
                    placeholder={placeholder}
                    searchLabel={searchLabel}
                    disabled={disabled}
                    className={`${heightClassName} rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName="gap-1 pr-2"
                    loading={controller.loading && controller.open}
                    onFocus={controller.handleInputFocus}
                    onChange={controller.handleInputChange}
                    onClear={() =>
                        controller.handleRemove((clearedValue) => {
                            if (onRemove) {
                                onRemove(clearedValue);
                                return;
                            }

                            onSelectAccount?.(null, '');
                        })
                    }
                />
            )}

            <AccountLookupSuggestions
                open={controller.open}
                query={controller.query}
                onQueryChange={controller.setQuery}
                loading={controller.loading}
                error={controller.error}
                rows={controller.rows}
                selectedLabels={controller.selectedLabels}
                onSelectAccount={(record, label) => controller.handleSelect(record, label, onSelectAccount)}
                showInlineSearch={isMultiValue}
            />
        </div>
    );
}

export function AccountLookupTextInput({
    value = '',
    placeholder = 'Cari/Pilih Akun Perkiraan...',
    searchLabel = 'Cari akun perkiraan',
    dialogTitle = 'Pilih Akun Perkiraan',
    disabled = false,
    className = 'h-[40px] rounded-[4px] border-[#cfd6e2]',
    inputClassName = 'text-[15px] text-[#1f2436]',
    trailingClassName = '',
    onSelectAccount = null,
}) {
    const controller = useAccountLookupController({ value, disabled });

    return (
        <div ref={controller.rootRef} className="relative">
            <AccountLookupSearchInput
                value={normalizeInputValue(controller.draftValue)}
                selectedValue={controller.selectedValue}
                placeholder={placeholder}
                searchLabel={searchLabel}
                disabled={disabled}
                className={className}
                inputClassName={inputClassName}
                trailingClassName={trailingClassName}
                loading={controller.loading && controller.open}
                onFocus={controller.handleInputFocus}
                onChange={controller.handleInputChange}
                onClear={() => controller.handleRemove(() => onSelectAccount?.(null, ''))}
            />

            <AccountLookupSuggestions
                open={controller.open}
                searchLabel={searchLabel}
                query={controller.query}
                loading={controller.loading}
                error={controller.error}
                rows={controller.rows}
                selectedLabels={controller.selectedLabels}
                onSelectAccount={(record, label) => controller.handleSelect(record, label, onSelectAccount)}
            />
        </div>
    );
}
