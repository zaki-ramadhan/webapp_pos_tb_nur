import { forwardRef } from 'react';

const Panel = forwardRef(function Panel({ children, className = '', ...props }, ref) {
    const hasRoundedClass = className.split(' ').some(c => c.startsWith('rounded-'));
    const roundedClass = hasRoundedClass ? '' : 'rounded-[12px]';
    const hasShadowClass = className.split(' ').some(c => c.startsWith('shadow-') || c === 'shadow');
    const shadowClass = hasShadowClass ? '' : 'shadow-panel-primary';

    return (
        <div
            ref={ref}
            className={`overflow-hidden bg-white ${shadowClass} ${roundedClass} ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
});

export default Panel;
