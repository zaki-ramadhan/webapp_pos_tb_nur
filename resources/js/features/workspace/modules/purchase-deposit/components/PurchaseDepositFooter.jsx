import { DepositDualTotalFooter } from '@/features/workspace/modules/shared/DepositWorkspaceShared';

export default function PurchaseDepositFooter({ values, setValues, onUpdateTaxSettings, readOnly = false }) {
    return <DepositDualTotalFooter values={values} setValues={setValues} onUpdateTaxSettings={onUpdateTaxSettings} readOnly={readOnly} />;
}
