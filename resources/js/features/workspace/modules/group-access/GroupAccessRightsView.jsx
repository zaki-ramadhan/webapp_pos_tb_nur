import { useEffect, useMemo, useState } from 'react';

import TextInput from '@/components/ui/TextInput';
import {
    applyPermissionPreset,
    buildPresetProfile,
    filterSections,
} from './groupAccessUtils';
import {
    CopyPermissionsButton,
    GroupAccessCategoryList,
    PermissionCell,
} from '@/features/workspace/modules/group-access/groupAccessViewShared';
import { InfoIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function FragmentSection({ section, columns, onTogglePermission }) {
    return (
        <>
            <tr className="border-t border-[#edf1f6] bg-white">
                <td
                    colSpan={columns.length + 1}
                    className="px-6 py-2.5 text-[18px] font-semibold text-[#141c2c]"
                >
                    {section.label}
                </td>
            </tr>

            {section.rows.map((row, index) => (
                <tr
                    key={row.id}
                    className={`border-t border-[#edf1f6] ${
                        index % 2 === 0 ? 'bg-[#f5f5f6]' : 'bg-white'
                    }`.trim()}
                >
                    <td className="px-8 py-2.5 text-[17px] text-[#222a3c]">
                        <div className="inline-flex items-start gap-2">
                            <span>{row.label}</span>
                            {row.info ? <InfoIcon className="mt-1 h-[18px] w-[18px] text-[#2f374d]" /> : null}
                        </div>
                    </td>
                    {columns.map((column) => (
                        <td key={column.id} className="px-4 py-2">
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
                        <tr className="bg-[#66677b] text-white">
                            <th className="px-8 py-2.5 text-center text-[17px] font-medium">Hak Akses</th>
                            {columns.map((column) => (
                                <th key={column.id} className="px-4 py-2.5 text-center text-[17px] font-medium">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                        <tr className="bg-[#d9d9dc]">
                            <th className="px-8 py-2" />
                            {columns.map((column) => {
                                const enabledRows = rowItems.filter((row) => row.permissions?.[column.id] !== undefined);
                                const checked = enabledRows.length
                                    ? enabledRows.every((row) => Boolean(row.permissions?.[column.id]))
                                    : false;

                                return (
                                    <th key={column.id} className="px-4 py-3">
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
                            <tr className="border-t border-[#edf1f6] bg-white">
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-6 py-10 text-center text-[16px] text-[#6a738a]"
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
        <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[370px_minmax(0,1fr)] xl:items-start">
                <GroupAccessCategoryList
                    categories={categories}
                    activeCategoryId={activeCategory?.id ?? ''}
                    onSelectCategory={setActiveCategoryId}
                    className="h-[calc(100vh-320px)] max-h-[720px]"
                />

                <div className="flex h-[calc(100vh-320px)] min-h-[460px] max-h-[720px] min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#d8dde7] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.08)]">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e6ee] px-4 py-4">
                        <div className="w-full max-w-[386px]">
                            <TextInput
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder={permissions.searchPlaceholder}
                                trailing={<SearchIcon className="h-6 w-6 text-[#1f2436]" />}
                                className="h-[44px] rounded-[6px] border-[#cfd6e2]"
                                inputClassName="text-[17px] text-[#1f2436]"
                            />
                        </div>

                        <CopyPermissionsButton
                            label={permissions.copyAccessLabel}
                            options={permissions.copyAccessOptions}
                            onSelect={handleCopyPermissions}
                        />
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
