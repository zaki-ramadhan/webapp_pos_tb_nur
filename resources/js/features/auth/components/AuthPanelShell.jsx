import { Link } from '@inertiajs/react';

import Panel from '@/components/ui/Panel';

export default function AuthPanelShell({ left, right }) {
    const maxHeightStyle = { maxHeight: 'calc(100dvh - 7.5rem)' };

    return (
        <div className="flex w-full max-w-[500px] flex-col items-center gap-4.5 lg:max-w-[960px]">
            <Panel className="grid w-full overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)]" style={maxHeightStyle}>
                <div className="hidden min-w-0 overflow-y-auto lg:block" style={maxHeightStyle}>{left}</div>
                <div className="min-w-0 overflow-y-auto bg-white" style={maxHeightStyle}>{right}</div>
            </Panel>

            <footer className="flex w-full items-center justify-end gap-3 text-xs leading-5 text-slate-600">
                <Link href="/privacy-policy" className="hover:text-slate-900 hover:underline">
                    Kebijakan Privasi
                </Link>
                <span className="text-slate-400">/</span>
                <Link href="/terms-of-service" className="hover:text-slate-900 hover:underline">
                    Syarat &amp; Ketentuan
                </Link>
            </footer>
        </div>
    );
}
