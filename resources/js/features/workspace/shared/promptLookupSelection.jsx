import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import TextInput from '@/components/ui/TextInput';
import { SearchIcon, LoadingIcon } from '@/features/workspace/shared/Icons';
import {
    extractBackendRows,
    getBackendErrorMessage,
    listBackendResource,
} from '@/features/workspace/backend/workspaceBackendApi';

function LookupSelectionModalContainer({ resource, title, labelBuilder, resolve, onDestroy, queryParams = {} }) {
    const [open, setOpen] = useState(true);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);
    const inputRef = useRef(null);

    function handleClose() {
        setOpen(false);
        setTimeout(() => {
            resolve(null);
            onDestroy();
        }, 300);
    }

    function handleSelect(record) {
        setOpen(false);
        setTimeout(() => {
            resolve(record);
            onDestroy();
        }, 300);
    }

    const queryParamsStr = JSON.stringify(queryParams);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError('');

        const timeoutId = setTimeout(async () => {
            try {
                const payload = await listBackendResource(resource, {
                    search: query.trim(),
                    per_page: 15,
                    ...queryParams,
                });
                if (!ignore) {
                    setRows(extractBackendRows(payload));
                }
            } catch (err) {
                if (!ignore) {
                    setRows([]);
                    setError(getBackendErrorMessage(err, `Gagal memuat data ${title}.`));
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }, 200);

        return () => {
            ignore = true;
            clearTimeout(timeoutId);
        };
    }, [query, resource, title, queryParamsStr]);

    return (
        <WorkspaceDialog
            open={open}
            onClose={handleClose}
            title={`Pilih ${title.charAt(0).toUpperCase() + title.slice(1)}`}
            maxWidthClassName="max-w-[480px]"
            contentClassName="bg-white px-5 py-4 sm:px-6 min-h-[320px] flex flex-col"
        >
            <div className="mb-4">
                <TextInput
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Ketik untuk mencari ${title.toLowerCase()}...`}
                    trailing={
                        loading ? (
                            <LoadingIcon className="h-4 w-4 animate-spin text-slate-400" />
                        ) : (
                            <SearchIcon className="h-4 w-4 text-slate-400" />
                        )
                    }
                    className="h-[40px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs text-slate-700"
                    autoFocus
                />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[280px] border border-table-row-border rounded-[4px] divide-y divide-table-row-border">
                {loading && rows.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs">
                        Memuat data...
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500 text-xs">
                        {error}
                    </div>
                ) : rows.length > 0 ? (
                    rows.map((record) => (
                        <button
                            key={record.id}
                            type="button"
                            onClick={() => handleSelect(record)}
                            className="flex w-full items-start px-4 py-2 text-left transition hover:bg-workspace-hover-bg active:bg-chart-grid-light cursor-pointer"
                        >
                            <span className="text-xs font-normal text-slate-700 truncate">
                                {labelBuilder(record)}
                            </span>
                        </button>
                    ))
                ) : (
                    <div className="p-4 text-center text-slate-400 text-xs">
                        Tidak ada data yang cocok.
                    </div>
                )}
            </div>
        </WorkspaceDialog>
    );
}

export function promptSelectBackendRecord(resource, title, labelBuilder, queryParams = {}) {
    return new Promise((resolve) => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const root = createRoot(div);

        function onDestroy() {
            root.unmount();
            div.remove();
        }

        root.render(
            <LookupSelectionModalContainer
                resource={resource}
                title={title}
                labelBuilder={labelBuilder}
                resolve={resolve}
                onDestroy={onDestroy}
                queryParams={queryParams}
            />
        );
    });
}
