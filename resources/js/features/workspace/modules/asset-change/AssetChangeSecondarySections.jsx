import {
    AccountLookupField,
} from '@/features/workspace/shared/AccountLookupControls';
import { TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { AssetChangeFieldRow, AssetChangeLookupField, InlineCheckboxField } from './AssetChangePrimarySections';

export function AssetChangeAdditionalInfoSection({ config, values, setValues, isDetail }) {
    return (
        <div className="min-h-[560px]">
            <TransactionSectionHeading title="Info Lainnya" icon="info" />

            <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.78fr)] xl:gap-x-10">
                <div className="space-y-3">
                    <AssetChangeFieldRow label={config.labels.intangibleAsset}>
                        <InlineCheckboxField checked={values.intangibleAsset} />
                    </AssetChangeFieldRow>
                    <AssetChangeFieldRow label={config.labels.branch} required>
                        <AssetChangeLookupField values={values.branch} placeholder={config.branchPlaceholder} searchLabel={config.branchSearchLabel} onRemove={isDetail ? null : (value) => setValues((current) => ({ ...current, branch: current.branch.filter((item) => item !== value) }))} className="max-w-[580px]" />
                    </AssetChangeFieldRow>
                    <AssetChangeFieldRow label={config.labels.department}>
                        <AssetChangeLookupField values={values.department} placeholder={config.departmentPlaceholder} searchLabel={config.departmentSearchLabel} onRemove={isDetail ? null : (value) => setValues((current) => ({ ...current, department: current.department.filter((item) => item !== value) }))} className="max-w-[580px]" />
                    </AssetChangeFieldRow>
                    <AssetChangeFieldRow label={config.labels.assetAccount}>
                        <AccountLookupField values={values.assetAccount} placeholder={config.assetAccountPlaceholder} searchLabel={config.assetAccountSearchLabel} dialogTitle="Pilih Akun Aset" onRemove={isDetail ? null : (value) => setValues((current) => ({ ...current, assetAccount: current.assetAccount.filter((item) => item !== value) }))} onSelectAccount={(_, label) => setValues((current) => ({ ...current, assetAccount: label ? [label] : [] }))} className="max-w-[580px]" />
                    </AssetChangeFieldRow>
                </div>

                <div className="space-y-3">
                    <AssetChangeFieldRow label={config.labels.tax}>
                        <InlineCheckboxField checked={values.taxEnabled} />
                    </AssetChangeFieldRow>
                </div>
            </div>
        </div>
    );
}
