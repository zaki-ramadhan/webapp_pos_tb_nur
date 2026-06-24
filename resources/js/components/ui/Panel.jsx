import { forwardRef } from 'react';

const Panel = forwardRef(function Panel({ children, className = '', ...props }, ref) {
    return (
        <div
            ref={ref}
            className={`overflow-hidden rounded-[12px] bg-white shadow-panel-primary ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
});

export default Panel;
