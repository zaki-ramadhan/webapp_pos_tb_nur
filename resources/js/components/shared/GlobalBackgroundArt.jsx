export default function GlobalBackgroundArt({ mode = 'auth' }) {
    const bgUrl = mode === 'workspace' ? '/assets/images/bg_home.webp' : '/assets/images/bg_login.webp';
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${bgUrl}')` }}
        />
    );
}
