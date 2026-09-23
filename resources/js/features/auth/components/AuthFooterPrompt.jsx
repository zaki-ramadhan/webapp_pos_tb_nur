import { Link } from '@inertiajs/react';

export default function AuthFooterPrompt({ prompt, cta, href }) {
    return (
        <div className="mt-6 text-center text-xs leading-5 text-slate-400">
            {prompt && cta && href ? (
                <div className="mb-2">
                    <span>{prompt}</span>{' '}
                    <Link href={href} className="font-medium text-google-blue hover:underline">
                        {cta}
                    </Link>
                </div>
            ) : null}
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
                <Link href="/privacy-policy" className="hover:text-slate-600 hover:underline">
                    Kebijakan Privasi
                </Link>
                <span className="text-slate-300">/</span>
                <Link href="/terms-of-service" className="hover:text-slate-600 hover:underline">
                    Syarat &amp; Ketentuan
                </Link>
            </div>
        </div>
    );
}

