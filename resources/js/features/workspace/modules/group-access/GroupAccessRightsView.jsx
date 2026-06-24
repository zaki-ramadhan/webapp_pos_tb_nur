import { useEffect, useMemo, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import {
    applyPermissionPreset,
    buildPresetProfile,
    filterSections,
} from './groupAccessUtils';
import {
    GroupAccessCategoryList,
    PermissionCell,
} from '@/features/workspace/modules/group-access/groupAccessViewShared';
import Tooltip from '@/components/ui/Tooltip';
import { InfoIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function getAccessRightTooltip(rowId, label) {
    const map = {
        'manual-number': 'Memungkinkan pengguna mengedit atau mengisi nomor dokumen transaksi secara manual.',
        'form-designer': 'Akses untuk mendesain tata letak dan cetakan dokumen formulir.',
        'smartlink-upload-all-branches': 'Pengguna dapat mengunggah file e-Faktur Pajak dari seluruh cabang perusahaan.',
        'report-export': 'Mengizinkan ekspor data laporan ke format eksternal seperti Excel atau PDF.',
        'edit-efaktur-transactions': 'Memungkinkan perubahan atau penghapusan transaksi yang faktur pajaknya sudah diunggah.',
        'ai-analysis': 'Akses ke fitur analisis data menggunakan kecerdasan buatan.',
    };
    return map[rowId] || `Informasi detail mengenai hak akses ${label}`;
}

function FragmentSection({ section, columns, onTogglePermission }) {
    return (
        <>
            <tr className="border-t border-table-row-border bg-white">
                <td
                    colSpan={columns.length + 1}
                    className="px-4 py-1.5 text-base font-semibold text-blue-141c2c"
                >
                    {section.label}
                </td>
            </tr>

            {section.rows.map((row, index) => (
                <tr
                    key={row.id}
                    className={`border-t border-table-row-border ${
                        index % 2 === 0 ? 'bg-ui-bg-panel-lighter' : 'bg-white'
                    }`.trim()}
                >
                    <td className="px-5 py-1.5 text-sm text-section-tab-accent-text">
                        <div className="inline-flex items-start gap-2">
                            <span>{row.label}</span>
                            {row.info ? (
                                <Tooltip content={getAccessRightTooltip(row.id, row.label)} portal>
                                    <InfoIcon className="mt-0.5 h-[16px] w-[16px] text-section-tab-neutral-text cursor-help" />
                                </Tooltip>
                            ) : null}
                        </div>
                    </td>

                    {columns.map((column) => (
                        <td key={column.id} className="px-4 py-1.5">
                            <PermissionCell
                                checked={Boolean(row.permissions?.[column.id])}
                                onChange={() => onTogglePermission(section.id, row.id, column.id)}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

function PermissionMatrix({
    columns,
    sections,
    onTogglePermission,
    onToggleColumn,
    className = '',
}) {
    const rowItems = sections.flatMap((section) => section.rows);

    return (
        <div className={`min-h-0 overflow-hidden ${className}`.trim()}>
            <div className="h-full overflow-auto">
                <table className="w-full min-w-[860px] border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-tab-view-active-text text-white">
                            <th className="px-5 py-2 text-center text-sm font-semibold">Hak Akses</th>
                            {columns.map((column) => (
                                <th key={column.id} className="px-4 py-2 text-center text-sm font-semibold">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                        <tr className="bg-tab-primary-inactive-bg">
                            <th className="px-5 py-1.5" />
                            {columns.map((column) => {
                                const enabledRows = rowItems.filter((row) => row.permissions?.[column.id] !== undefined);
                                const checked = enabledRows.length
                                    ? enabledRows.every((row) => Boolean(row.permissions?.[column.id]))
                                    : false;

                                return (
                                    <th key={column.id} className="px-4 py-2">
                                        <PermissionCell
                                            checked={checked}
                                            onChange={() => onToggleColumn(column.id, !checked)}
                                        />
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {sections.length ? (
                            sections.map((section) => (
                                <FragmentSection
                                    key={section.id}
                                    section={section}
                                    columns={columns}
                                    onTogglePermission={onTogglePermission}
                                />
                            ))
                        ) : (
                            <tr className="border-t border-table-row-border bg-white">
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-6 py-10 text-center text-sm text-text-muted"
                                >
                                    Tidak ada hak akses yang cocok dengan kata kunci pencarian.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function GroupAccessRightsView({
    permissions,
    categories,
    onUpdateCategories,
}) {
    const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? '');
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        if (categories.some((category) => category.id === activeCategoryId)) {
            return;
        }

        setActiveCategoryId(categories[0]?.id ?? '');
    }, [activeCategoryId, categories]);

    const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0];
    const filteredSections = useMemo(
        () => filterSections(activeCategory?.sections ?? [], keyword),
        [activeCategory?.sections, keyword],
    );

    function handleTogglePermission(sectionId, rowId, permissionId) {
        onUpdateCategories((currentCategories) =>
            currentCategories.map((category) =>
                category.id !== activeCategory.id
                    ? category
                    : {
                          ...category,
                          sections: category.sections.map((section) =>
                              section.id !== sectionId
                                  ? section
                                  : {
                                        ...section,
                                        rows: section.rows.map((row) =>
                                            row.id !== rowId
                                                ? row
                                                : {
                                                      ...row,
                                                      permissions: {
                                                          ...row.permissions,
                                                          [permissionId]: !row.permissions?.[permissionId],
                                                      },
                                                  },
                                        ),
                                    },
                          ),
                      },
            ),
        );
    }

    function handleToggleColumn(permissionId, nextValue) {
        const visibleRowIds = new Set(filteredSections.flatMap((section) => section.rows.map((row) => row.id)));

        onUpdateCategories((currentCategories) =>
            currentCategories.map((category) =>
                category.id !== activeCategory.id
                    ? category
                    : {
                          ...category,
                          sections: category.sections.map((section) => ({
                              ...section,
                              rows: section.rows.map((row) =>
                                  !visibleRowIds.has(row.id)
                                      ? row
                                      : {
                                            ...row,
                                            permissions: {
                                                ...row.permissions,
                                                [permissionId]: nextValue,
                                            },
                                        },
                              ),
                          })),
                      },
            ),
        );
    }

    function handleCopyPermissions(presetId) {
        onUpdateCategories((currentCategories) =>
            applyPermissionPreset(currentCategories, buildPresetProfile(presetId)),
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-5 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-start">
                <GroupAccessCategoryList
                    categories={categories}
                    activeCategoryId={activeCategory?.id ?? ''}
                    onSelectCategory={setActiveCategoryId}
                    className="h-[calc(100vh-260px)]"
                />

                <div className="flex h-[calc(100vh-260px)] min-h-[460px] min-w-0 flex-col overflow-hidden rounded-[8px] border border-ui-border-medium bg-white shadow-panel-subtle">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ui-border-light px-4 py-4">
                        <div className="w-full max-w-[386px]">
                            <TextInput
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder={permissions.searchPlaceholder}
                                trailing={<SearchIcon className="h-6 w-6 text-brand-dark" />}
                                className="h-[44px] rounded-[6px] border-ui-border"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                            />
                        </div>


                    </div>

                    <PermissionMatrix
                        columns={permissions.columns}
                        sections={filteredSections}
                        onTogglePermission={handleTogglePermission}
                        onToggleColumn={handleToggleColumn}
                        className="min-h-0 flex-1"
                    />
                </div>
            </div>
        </div>
    );
}
