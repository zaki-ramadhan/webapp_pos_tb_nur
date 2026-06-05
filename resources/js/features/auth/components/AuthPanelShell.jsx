import Panel from '@/components/ui/Panel';

export default function AuthPanelShell({ left, right }) {
    const maxHeightStyle = { maxHeight: 'calc(100dvh - 6rem)' };

    return (
        <Panel className="grid w-full max-w-[500px] overflow-hidden lg:max-w-[960px] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)]" style={maxHeightStyle}>
            <div className="hidden min-w-0 overflow-y-auto lg:block" style={maxHeightStyle}>{left}</div>
            <div className="min-w-0 overflow-y-auto bg-white" style={maxHeightStyle}>{right}</div>
        </Panel>
    );
}
