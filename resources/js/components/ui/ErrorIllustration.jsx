export default function ErrorIllustration({ className = '' }) {
    return (
        <img src="/assets/images/pop-up-warning-icon.svg" className={`h-14 w-14 shrink-0 ${className}`.trim()} alt="Error" aria-hidden="true" />
    );
}
