import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import Tooltip from '@/components/ui/Tooltip';
import { CloseIcon, InfoIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function getFieldInfoTooltip(label) {
    const cleanLabel = String(label || '').trim().replace(/:$/, '');
    return `Informasi tentang ${cleanLabel}`;
}

export function FieldLabel({ field, className = '' }) {
    return (
        <label className={`text-xs sm:text-sm text-brand-dark ${className}`.trim()}>
            {field.label}
            {field.required ? <span className="text-tab-active-border-t"> *</span> : null}
            {field.info ? (
                <Tooltip content={typeof field.info === 'string' ? field.info : getFieldInfoTooltip(field.label)} portal>
                    <InfoIcon className="ml-1 inline-flex h-4.5 w-4.5 align-[-2px] text-filter-select-text cursor-help" />
                </Tooltip>
            ) : null}
        </label>
    );
}


export function MasterFieldRow({ field, value, onChange, isDetailMode = false }) {
    if (field.type === 'heading') {
        return (
            <div className={`pt-2.5 pb-1 md:col-span-2 border-b border-ui-border-medium ${field.containerClassName ?? ''}`.trim()}>
                <div className="text-xs font-semibold text-brand-dark uppercase tracking-wider">{field.label}</div>
            </div>
        );
    }

    if (field.type === 'checkbox') {
        return (
            <div className="grid gap-3 lg:grid-cols-[170px_1fr] lg:items-center">
                <FieldLabel field={field} />
                <CheckboxField
                    id={field.id}
                    label={field.checkboxLabel ?? field.label}
                    checked={Boolean(value)}
                    onChange={(event) => onChange(field.id, event.target.value)}
                    align="center"
                    labelClassName="text-base md:text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName={field.containerClassName ?? 'w-auto'}
                />
            </div>
        );
    }

    if (field.type === 'textarea') {
        return (
            <div className="grid gap-3 lg:grid-cols-[170px_1fr] lg:items-start">
                <FieldLabel field={field} className="pt-2" />
                <div>
                    <TextareaField
                        id={field.id}
                        name={field.id}
                        value={value}
                        onChange={(event) => onChange(field.id, event.target.value)}
                        rows={field.rows ?? 3}
                        className={`rounded-[4px] border-ui-border ${field.className ?? ''}`.trim()}
                        textareaClassName={`text-xs sm:text-sm text-brand-dark ${field.textareaClassName ?? ''}`.trim()}
                        containerClassName={field.containerClassName ?? ''}
                    />
                </div>
            </div>
        );
    }

    if (field.type === 'lookup') {
        return (
            <div className="grid gap-3 lg:grid-cols-[170px_1fr] lg:items-center">
                <FieldLabel field={field} />
                <div>
                    <TextInput
                        id={field.id}
                        name={field.id}
                        value={value}
                        onChange={(event) => onChange(field.id, event.target.value)}
                        placeholder={field.placeholder ?? 'Cari/Pilih...'}
                        className={`h-[40px] rounded-[4px] border-ui-border ${field.className ?? ''}`.trim()}
                        inputClassName="text-xs sm:text-sm text-brand-dark font-normal"
                        containerClassName={field.containerClassName ?? ''}
                        trailing={<SearchIcon className="h-5 w-5 text-text-darkest" />}
                        trailingClassName="px-3"
                    />
                </div>
            </div>
        );
    }

    const isCodeOrIdField = isDetailMode && ['id', 'code', 'number', 'unitCode', 'categoryCode', 'departmentCode'].includes(field.id);

    return (
        <div className="grid gap-3 lg:grid-cols-[170px_1fr] lg:items-center">
            <FieldLabel field={field} />
            <div>
                <TextInput
                    id={field.id}
                    name={field.id}
                    value={value}
                    onChange={(event) => onChange(field.id, event.target.value)}
                    readOnly={Boolean(field.readOnly || isCodeOrIdField)}
                    className={`h-[40px] rounded-[4px] border-ui-border ${field.className ?? ''}`.trim()}
                    inputClassName="text-xs sm:text-sm text-brand-dark font-normal"
                    containerClassName={field.containerClassName ?? ''}
                    trailing={
                        !isCodeOrIdField && field.clearable && value ? (
                            <button
                                type="button"
                                onClick={() => onChange(field.id, '')}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-text-darkest transition hover:bg-bg-workspace-light"
                                aria-label={`Kosongkan ${field.label}`}
                            >
                                <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                            </button>
                        ) : null
                    }
                    trailingClassName={field.clearable && !isCodeOrIdField ? 'pr-2' : ''}
                />
            </div>
        </div>
    );
}

export function StandaloneCheckboxField({ field, value, onChange }) {
    return (
        <div className={field.offsetClassName ?? 'lg:pl-[182px]'}>
            <CheckboxField
                id={field.id}
                label={field.label}
                checked={Boolean(value)}
                onChange={(event) => onChange(field.id, event.target.checked)}
                align="center"
                labelClassName="text-base md:text-base"
                inputClassName="mt-0 h-[18px] w-[18px]"
                containerClassName={field.containerClassName ?? 'w-auto'}
            />
        </div>
    );
}
