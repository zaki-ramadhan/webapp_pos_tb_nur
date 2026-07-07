import { router } from '@inertiajs/react';
import { useRef, useState, useEffect } from 'react';

import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import Spinner from '@/components/ui/Spinner';
import BrandMark from '@/features/auth/components/BrandMark';
import { clearWorkspaceClientState } from '@/features/workspace/dashboard/workspaceClientState';
import { ChevronDownIcon, LogoutIcon, ViewModeIcon } from '@/features/workspace/shared/Icons';
import UserAvatar from '@/features/workspace/shared/UserAvatar';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

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
    contextLabel = 'Workspace Aktif',
    user,
    workspaceMenuOpen = false,
    onToggleWorkspaceMenu,
}) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const userMenuButtonRef = useRef(null);

    const [headerBg, setHeaderBg] = useState(() => {
        if (typeof window === 'undefined') return '/assets/images/panel-header-background_2.svg';
        try {
            return localStorage.getItem('header_bg_cache') || '/assets/images/panel-header-background_2.svg';
        } catch {
            return '/assets/images/panel-header-background_2.svg';
        }
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const cached = localStorage.getItem('header_bg_cache');
            if (cached) {
                setHeaderBg(cached);
                return;
            }
        } catch {}

        let active = true;
        fetch('/assets/images/panel-header-background_2.svg')
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.text();
            })
            .then((svgText) => {
                if (!active) return;
                try {
                    const base64 = btoa(unescape(encodeURIComponent(svgText)));
                    const dataUrl = `data:image/svg+xml;base64,${base64}`;
                    localStorage.setItem('header_bg_cache', dataUrl);
                    setHeaderBg(dataUrl);
                } catch {}
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, []);

    function handleLogout() {
        setIsUserMenuOpen(false);
        setIsLogoutConfirmOpen(true);
    }

    function executeLogout() {
        if (isLoggingOut) {
            return;
        }

        setIsLogoutConfirmOpen(false);
        setIsLoggingOut(true);
        clearWorkspaceClientState();
        router.post('/logout', {}, {
            onFinish: () => setIsLoggingOut(false),
        });
    }

    return (
        <header className="relative z-20 bg-[#f2f2f2] h-[46px] text-white shadow-topbar overflow-hidden">
            <div 
                className="absolute inset-0 z-0 bg-left-top bg-no-repeat pointer-events-none"
                style={{ backgroundImage: `url(${headerBg})`, backgroundSize: '1920px 46px' }}
            />
            <div className="relative z-10 flex h-full items-center justify-between pl-3 sm:pl-4">
                <div className="flex min-w-0 items-center">
                    <BrandMark
                        variant="decorative"
                        className="shrink-0 scale-[0.85] origin-left sm:scale-[0.9]"
                        titleClassName="!text-sm sm:!text-[15px] md:!text-base !font-semibold"
                        subtitleClassName="!text-[11px] sm:!text-[11.5px] md:!text-xs"
                    />

                </div>

                <div className="ml-auto flex h-full items-center gap-1 bg-gradient-to-l from-[#162b48] via-[#1c3e6b] to-transparent pl-12 pr-3 sm:gap-1.5 lg:gap-1.5 sm:pr-4">
                    <div className="lg:hidden">
                        <TopBarIcon label="Menu workspace" onClick={onToggleWorkspaceMenu}>
                            <ViewModeIcon
                                className={`h-4.5 w-4.5 text-white/90 transition ${
                                    workspaceMenuOpen ? 'scale-105 text-white' : ''
                                }`.trim()}
                            />
                        </TopBarIcon>
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
                                <p className="truncate text-sm font-normal text-white md:text-sm">{user.name}</p>
                                <p className="truncate text-xs font-light text-white md:text-xs">
                                    {user.role || 'Pengguna'}
                                </p>
                            </div>

                            <UserAvatar
                                name={user.name}
                                imageUrl={user.avatarUrl}
                                className="h-7 w-7 bg-white text-xs font-semibold text-tab-primary-inactive-text sm:h-7.5 sm:w-7.5 sm:text-xs md:h-8 md:w-8 md:text-xs"
                                showStatusIndicator={false}
                            />

                            <span className="text-white">
                                <ChevronDownIcon className="h-4 w-4" strokeWidth={2.8} />
                            </span>
                        </button>

                        <DropdownMenu
                            open={isUserMenuOpen}
                            onClose={() => setIsUserMenuOpen(false)}
                            anchorRef={userMenuButtonRef}
                            widthClassName="w-[min(180px,calc(100vw-1rem))]"
                            className="z-[70]"
                        >
                            <div className="border-b border-table-row-border px-3 py-2 text-left lg:hidden">
                                <p className="truncate text-xs font-semibold text-brand-darker">{user.name}</p>
                                <p className="truncate text-[10px] text-text-light">{user.role || 'Pengguna'}</p>
                            </div>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                icon={isLoggingOut ? <Spinner className="h-4 w-4 text-brand-blue-dark" /> : <LogoutIcon />}
                                disabled={isLoggingOut}
                                className="text-xs font-medium text-brand-darker md:text-sm"
                            >
                                {isLoggingOut ? 'Memproses logout...' : 'Logout'}
                            </DropdownMenuItem>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                open={isLogoutConfirmOpen}
                onClose={() => setIsLogoutConfirmOpen(false)}
                onConfirm={executeLogout}
                title="Konfirmasi Keluar"
                message="Apakah Anda yakin ingin keluar dari aplikasi?"
                confirmLabel="Keluar"
                cancelLabel="Batal"
                confirmVariant="danger"
                confirmLoading={isLoggingOut}
            />
        </header>
    );
}
