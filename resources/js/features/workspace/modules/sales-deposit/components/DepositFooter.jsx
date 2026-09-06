import { DepositAmountField, DepositDualTotalFooter, DepositStamp } from '@/features/workspace/modules/shared/DepositWorkspaceShared';

export { DepositAmountField, DepositStamp };

export default function DepositFooter({ values }) {
    return <DepositDualTotalFooter values={values} />;
}
