import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import EmptyState from '@/components/ui/EmptyState';
import BrandMark from '@/features/auth/components/BrandMark';
import { BellIcon, ChevronDownIcon, LogoutIcon, SearchIcon, ViewModeIcon } from '@/features/workspace/shared/Icons';
import UserAvatar from '@/features/workspace/shared/UserAvatar';

function TopBarIcon({ children, label, onClick, buttonRef }) {
    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={onClick}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 sm:h-8.5 sm:w-8.5 md:h-9 md:w-9"
            aria-label={label}
        >
            {children}
        </button>
    );
}

export default function DashboardTopBar({
    locale,
    currentIp,
    user,
    sample,
    workspaceMenuOpen = false,
    onToggleWorkspaceMenu,
    onOpenSearch,
}) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const notificationButtonRef = useRef(null);
    const userMenuButtonRef = useRef(null);

    function handleLogout() {
        setIsUserMenuOpen(false);
        router.visit('/');
    }

    return (
        <header className="relative z-20 border-b border-[#ED3969] bg-[linear-gradient(90deg,#213e75_0%,#1b315d_100%)] px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(15,23,42,0.14)] sm:px-4 sm:py-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <BrandMark
                        name="accurate"
                        className="shrink-0 scale-[0.76] origin-left sm:scale-[0.82]"
                        badgeClassName="shadow-none"
                        textClassName="text-white"
                    />
                    <div className="hidden min-w-0 items-center gap-2 text-[12px] text-white/80 md:flex md:text-[13px]">
                        <span className="h-5 w-px bg-white/20" />
                        <span className="truncate">IP Saat ini: {currentIp}</span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-1 sm:gap-1.5 lg:gap-1.5">
                    <div className="lg:hidden">
                        <TopBarIcon label="Menu workspace" onClick={onToggleWorkspaceMenu}>
                            <ViewModeIcon
                                className={`h-4.5 w-4.5 text-white/90 transition ${
                                    workspaceMenuOpen ? 'scale-105 text-white' : ''
                                }`.trim()}
                            />
                        </TopBarIcon>
                    </div>
                    <TopBarIcon label="Cari" onClick={onOpenSearch}>
                        <SearchIcon className="h-4.5 w-4.5 text-white/90 sm:h-5 sm:w-5" />
                    </TopBarIcon>
                    <div className="relative">
                        <TopBarIcon
                            label="Notifikasi"
                            buttonRef={notificationButtonRef}
                            onClick={() => setIsNotificationOpen((currentValue) => !currentValue)}
                        >
                            <BellIcon className="h-4.5 w-4.5 text-white/90 sm:h-5 sm:w-5" />
                        </TopBarIcon>

                        <DropdownMenu
                            open={isNotificationOpen}
                            onClose={() => setIsNotificationOpen(false)}
                            anchorRef={notificationButtonRef}
                            widthClassName="w-[min(404px,calc(100vw-1rem))]"
                            className="z-[70]"
                            panelClassName="min-h-[360px] rounded-[8px] border-[#d6d6d6] p-0 shadow-[0_8px_18px_rgba(15,23,42,0.18)] sm:min-h-[420px]"
                        >
                            <EmptyState
                                fill
                                tone="subtle"
                                size="sm"
                                iconName="notification"
                                title="Tidak ada pemberitahuan"
                                description="Pemberitahuan baru akan muncul di sini."
                                className="min-h-[360px] rounded-[8px] px-4 py-6 sm:min-h-[420px] sm:px-6"
                                titleClassName="text-[16px] font-medium text-[#4f5678] sm:text-[18px]"
                                descriptionClassName="mt-2 text-[13px] leading-5 text-[#7f889d]"
                            />
                        </DropdownMenu>
                    </div>

                    <div className="h-5 w-px bg-white/20" />

                    <div className="relative">
                        <button
                            ref={userMenuButtonRef}
                            type="button"
                            onClick={() => setIsUserMenuOpen((currentValue) => !currentValue)}
                            className="inline-flex min-w-0 items-center gap-1.5 rounded-[6px] px-1.5 py-0.5 text-left transition hover:bg-white/10 sm:gap-2.5 sm:px-2"
                            aria-label="Buka menu pengguna"
                        >
                            <div className="hidden min-w-0 text-right leading-tight lg:block">
                                <p className="truncate text-[13px] font-semibold text-white md:text-[14px]">{sample.label}</p>
                                <p className="truncate text-[11px] text-white/75 md:text-[12px]">
                                    {user.name}
                                    {user.role ? ` • ${user.role}` : ''}
                                </p>
                            </div>

                            <UserAvatar
                                name={user.name}
                                className="h-7 w-7 bg-white text-[11px] font-semibold text-[#56607c] sm:h-7.5 sm:w-7.5 sm:text-[11px] md:h-8 md:w-8 md:text-[12px]"
                                statusClassName="bg-[#45c678]"
                            />

                            <span className="text-white/80">
                                <ChevronDownIcon className="h-4 w-4" />
                            </span>
                        </button>

                        <DropdownMenu
                            open={isUserMenuOpen}
                            onClose={() => setIsUserMenuOpen(false)}
                            anchorRef={userMenuButtonRef}
                            widthClassName="w-[min(180px,calc(100vw-1rem))]"
                            className="z-[70]"
                        >
                            <DropdownMenuItem
                                onClick={handleLogout}
                                icon={<LogoutIcon />}
                                className="text-[12px] font-medium text-[#1f2536] md:text-[13px]"
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

        </header>
    );
}
