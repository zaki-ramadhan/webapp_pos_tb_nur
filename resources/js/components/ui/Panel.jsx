import { forwardRef } from 'react';

const Panel = forwardRef(function Panel({ children, className = '', ...props }, ref) {
    return (
        <div
            ref={ref}
            className={`overflow-hidden rounded-[12px] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
});

export default Panel;
