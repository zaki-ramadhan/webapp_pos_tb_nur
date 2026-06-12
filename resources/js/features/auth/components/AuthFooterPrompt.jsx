import { Link } from '@inertiajs/react';

export default function AuthFooterPrompt({ prompt, cta, href }) {
    if (!prompt || !cta || !href) {
        return null;
    }

    return (
        <div className="mt-8 text-center text-base leading-7 text-slate-400">
            <span>{prompt}</span>{' '}
            <Link href={href} className="font-medium text-[#4285f4] hover:underline">
                {cta}
            </Link>
        </div>
    );
}
