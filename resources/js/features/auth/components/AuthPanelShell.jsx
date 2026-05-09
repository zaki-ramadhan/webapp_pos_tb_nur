import Panel from '@/components/ui/Panel';

export default function AuthPanelShell({ left, right }) {
    return (
        <Panel className="grid w-full max-w-[560px] overflow-hidden lg:max-w-[1100px] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)]">
            <div className="hidden min-w-0 bg-[#fbfbfd] lg:block">{left}</div>
            <div className="min-w-0 bg-white">{right}</div>
        </Panel>
    );
}
