export default function GlobalBackgroundArt({ mode = 'auth' }) {
    const bgUrl = mode === 'workspace' ? '/bg_home.png' : '/bg_login.png';
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${bgUrl}')` }}
        />
    );
}
