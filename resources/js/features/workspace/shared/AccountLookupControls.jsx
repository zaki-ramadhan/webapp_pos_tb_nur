import { useRef } from 'react';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import { useFormError } from '@/components/ui/FormErrorContext';

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
    id,
    name,
    error = '',
    message = '',
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
    queryParams = {},
    showType = false,
    resource = 'accounts',
}) {
    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, name, id);
    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);

    const controller = useAccountLookupController({ value, values, disabled, queryParams, resource });
    const isMultiValue = Array.isArray(values);
    const inputWrapperRef = useRef(null);

    return (
        <div ref={controller.rootRef} className="relative">
            {isMultiValue ? (
                <ChipLookupField
                    containerRef={inputWrapperRef}
                    id={id}
                    value={value}
                    values={values}
                    placeholder={placeholder}
                    searchLabel={searchLabel}
                    onRemove={(val) => {
                        onRemove?.(val);
                        clearError(contextKey);
                    }}
                    onSearch={disabled ? null : () => controller.openLookup('')}
                    disabled={disabled}
                    className={className}
                    contentClassName={contentClassName}
                    chipClassName={chipClassName}
                    heightClassName={heightClassName}
                    searching={controller.loading && controller.open}
                    error={Boolean(resolvedError)}
                />
            ) : (
                <AccountLookupSearchInput
                    containerRef={inputWrapperRef}
                    id={id}
                    value={controller.draftValue}
                    selectedValue={controller.selectedValue}
                    placeholder={placeholder}
                    searchLabel={searchLabel}
                    disabled={disabled}
                    className={`${heightClassName} rounded-[4px] ${resolvedError ? 'border-danger focus-within:border-danger focus-within:shadow-input-error-focus' : 'border-slate-400'} ${className}`.trim()}
                    inputClassName="text-xs sm:text-sm text-brand-dark"
                    trailingClassName="gap-1 pr-2"
                    loading={controller.loading && controller.open}
                    onFocus={controller.handleInputFocus}
                    onChange={controller.handleInputChange}
                    error={Boolean(resolvedError)}
                    onClear={() =>
                        controller.handleRemove((clearedValue) => {
                            if (onRemove) {
                                onRemove(clearedValue);
                            } else {
                                onSelectAccount?.(null, '');
                            }
                            clearError(contextKey);
                        })
                    }
                />
            )}

            <AccountLookupSuggestions
                anchorRef={inputWrapperRef}
                open={controller.open}
                query={controller.query}
                loading={controller.loading}
                error={controller.error}
                rows={controller.rows}
                selectedLabels={controller.selectedLabels}
                onSelectAccount={(record, label) => {
                    controller.handleSelect(record, label, onSelectAccount);
                    clearError(contextKey);
                }}
                showType={showType}
                resource={resource}
            />

            {feedbackMessage ? (
                <p className="mt-1.5 text-[11px] sm:text-xs leading-5 text-error-border">
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}

export function AccountLookupTextInput({
    id,
    name,
    error = '',
    message = '',
    value = '',
    placeholder = 'Cari/Pilih Akun Perkiraan...',
    searchLabel = 'Cari akun perkiraan',
    dialogTitle = 'Pilih Akun Perkiraan',
    disabled = false,
    className = 'h-[40px] rounded-[4px] border-slate-400',
    inputClassName = 'text-xs sm:text-sm text-brand-dark',
    trailingClassName = '',
    onSelectAccount = null,
    queryParams = {},
    showType = false,
    resource = 'accounts',
}) {
    const { errorMessage: contextErrorMessage, contextKey, clearError } = useFormError(error, name, id);
    const resolvedError = contextErrorMessage || (typeof error === 'boolean' ? error : '');
    const feedbackMessage = contextErrorMessage || (typeof error === 'string' ? (error || message) : message);

    const controller = useAccountLookupController({ value, disabled, queryParams, resource });
    const inputWrapperRef = useRef(null);

    return (
        <div ref={controller.rootRef} className="relative">
            <AccountLookupSearchInput
                containerRef={inputWrapperRef}
                id={id}
                value={normalizeInputValue(controller.draftValue)}
                selectedValue={controller.selectedValue}
                placeholder={placeholder}
                searchLabel={searchLabel}
                disabled={disabled}
                className={`${resolvedError ? 'border-danger focus-within:border-danger focus-within:shadow-input-error-focus' : ''} ${className}`.trim()}
                inputClassName={inputClassName}
                trailingClassName={trailingClassName}
                loading={controller.loading && controller.open}
                onFocus={controller.handleInputFocus}
                onChange={controller.handleInputChange}
                error={Boolean(resolvedError)}
                onClear={() =>
                    controller.handleRemove(() => {
                        onSelectAccount?.(null, '');
                        clearError(contextKey);
                    })
                }
            />

            <AccountLookupSuggestions
                anchorRef={inputWrapperRef}
                open={controller.open}
                searchLabel={searchLabel}
                query={controller.query}
                loading={controller.loading}
                error={controller.error}
                rows={controller.rows}
                selectedLabels={controller.selectedLabels}
                onSelectAccount={(record, label) => {
                    controller.handleSelect(record, label, onSelectAccount);
                    clearError(contextKey);
                }}
                showType={showType}
                resource={resource}
            />

            {feedbackMessage ? (
                <p className="mt-1.5 text-[11px] sm:text-xs leading-5 text-error-border">
                    {feedbackMessage}
                </p>
            ) : null}
        </div>
    );
}
