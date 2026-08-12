import { TableActionIcon } from '@/features/workspace/shared/Icons';

export function CashReceiptEmptyLineRow({ colSpan, emptyLabel }) {
    return (
        <tr className="bg-white">
            <td className="px-3 text-center text-text-workspace-inactive">
                <TableActionIcon className="mx-auto h-4 w-4" />
            </td>
            <td
                colSpan={colSpan - 1}
                className="px-3 py-2 text-center text-base text-black"
            >
                {emptyLabel}
            </td>
        </tr>
    );
}
