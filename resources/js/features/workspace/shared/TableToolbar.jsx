import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import TextInput from '@/components/ui/TextInput';
import {
    ChevronDownIcon,
    PlusIcon,
    PrintIcon,
    RefreshIcon,
    SearchIcon,
    TableActionIcon,
} from '@/features/workspace/shared/Icons';

const SIZE_STYLES = {
    compact: {
        createButton: 'h-[34px] min-w-[60px] px-3',
        utilityButton: 'h-[34px] w-[40px]',
        menuButton: 'h-[34px] min-w-[48px] px-2',
        searchInput: 'h-[34px]',
        pageInput: 'h-[34px] w-[68px] sm:w-[74px]',
        createIcon: 'h-5 w-5',
        searchIcon: 'h-5 w-5',
        searchText: 'text-[15px]',
    },
    default: {
        createButton: 'h-[40px] min-w-[72px] px-3.5',
        utilityButton: 'h-[40px] w-[50px]',
        menuButton: 'h-[40px] min-w-[50px] px-2',
        searchInput: 'h-[40px]',
        pageInput: 'h-[40px] w-[70px] sm:w-[76px]',
        createIcon: 'h-7 w-7',
        searchIcon: 'h-6 w-6',
        searchText: 'text-[17px]',
    },
};

function ToolbarIconButton({ label, onClick, className, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            aria-label={label}
        >
            {children}
        </button>
    );
}

function ToolbarActionMenu({ menuButton, sizeStyle }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    if (!menuButton?.items?.length) {
        return null;
    }

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-2 text-[#2353a0] ${sizeStyle.menuButton} ${menuButton.buttonClassName ?? ''}`.trim()}
                aria-label={menuButton.label}
            >
                {menuButton.icon ?? <TableActionIcon />}
                <ChevronDownIcon />
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName={menuButton.widthClassName ?? 'w-[180px]'}
            >
                <div className="flex flex-col">
                    {menuButton.items.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => {
                                item.onClick?.();
                                setOpen(false);
                            }}
                            icon={item.icon}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}

export default function TableToolbar({
    size = 'default',
    filters = null,
    createButton = null,
    refreshButton = null,
    leftControls = null,
    printButton = null,
    menuButton = null,
    rightControls = null,
    search = null,
    pageValue = null,
    className = '',
    topRowClassName = '',
    bottomRowClassName = '',
    rightControlsClassName = '',
}) {
    const sizeStyle = SIZE_STYLES[size] ?? SIZE_STYLES.default;
    const searchLoading = Boolean(search?.loading ?? refreshButton?.loading);
    const searchTrailing = searchLoading
        ? <RefreshIcon className={`${sizeStyle.searchIcon} animate-spin`.trim()} />
        : (search?.trailing ?? <SearchIcon className={sizeStyle.searchIcon} />);

    return (
        <div className={className}>
            {filters ? (
                <div className={`flex flex-wrap items-center justify-between gap-3 ${topRowClassName}`.trim()}>
                    <div className="flex w-full flex-wrap items-center gap-3">{filters}</div>
                </div>
            ) : null}

            <div
                className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${filters ? 'mt-3' : ''} ${bottomRowClassName}`.trim()}
            >
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    {createButton ? (
                        <ToolbarIconButton
                            label={createButton.label}
                            onClick={createButton.onClick}
                            className={`inline-flex shrink-0 items-center justify-center rounded-[4px] bg-[#2353a0] text-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${sizeStyle.createButton}`.trim()}
                        >
                            {createButton.icon ?? <PlusIcon className={sizeStyle.createIcon} />}
                        </ToolbarIconButton>
                    ) : null}

                    {refreshButton ? (
                        <ToolbarIconButton
                            label={refreshButton.label}
                            onClick={refreshButton.loading ? undefined : refreshButton.onClick}
                            className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${sizeStyle.utilityButton} ${refreshButton.loading ? 'pointer-events-none opacity-80' : ''}`.trim()}
                        >
                            <span className={refreshButton.loading ? 'animate-spin' : ''}>
                                {refreshButton.icon ?? <RefreshIcon />}
                            </span>
                        </ToolbarIconButton>
                    ) : null}

                    {leftControls}
                </div>

                <div
                    className={`flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center md:flex-nowrap ${rightControlsClassName}`.trim()}
                >
                    {rightControls ? <div className="flex shrink-0 flex-row flex-wrap items-center gap-2">{rightControls}</div> : null}

                    {menuButton ? <ToolbarActionMenu menuButton={menuButton} sizeStyle={sizeStyle} /> : null}

                    {printButton ? (
                        <ToolbarIconButton
                            label={printButton.label}
                            onClick={printButton.onClick}
                            className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${sizeStyle.utilityButton}`.trim()}
                        >
                            {printButton.icon ?? <PrintIcon />}
                        </ToolbarIconButton>
                    ) : null}

                    {search ? (
                        <TextInput
                            value={search.value}
                            onChange={search.onChange}
                            placeholder={search.placeholder}
                            trailing={searchTrailing}
                            className={`${sizeStyle.searchInput} w-full rounded-[4px] border-[#cfd6e2] ${search.widthClassName ?? 'sm:max-w-[248px]'}`.trim()}
                            inputClassName={search.inputClassName ?? `${sizeStyle.searchText} text-[#1f2436]`}
                            trailingClassName={search.trailingClassName ?? 'px-3'}
                        />
                    ) : null}

                    {pageValue !== null ? (
                        <TextInput
                            value={pageValue}
                            readOnly
                            className={`rounded-[4px] border-[#cfd6e2] ${sizeStyle.pageInput}`.trim()}
                            inputClassName={size === 'compact' ? 'text-right text-[15px]' : 'text-right text-[17px] text-[#646d83]'}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
