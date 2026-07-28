import CheckboxField from '@/components/ui/CheckboxField';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { ClearableTextInput, ItemCategoryFieldRow } from './itemCategoryHelpers';

export default function ItemCategoryGeneralTab({ config, values, onChange, parentCategoryOptions = [] }) {
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
