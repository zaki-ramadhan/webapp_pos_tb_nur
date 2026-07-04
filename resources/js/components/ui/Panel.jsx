import { forwardRef } from 'react';

const Panel = forwardRef(function Panel({ children, className = '', ...props }, ref) {
    const hasRoundedClass = className.split(' ').some(c => c.startsWith('rounded-'));
    const roundedClass = hasRoundedClass ? '' : 'rounded-[12px]';

    return (
        <div
            ref={ref}
            className={`overflow-hidden bg-white shadow-panel-primary ${roundedClass} ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
});

export default Panel;
