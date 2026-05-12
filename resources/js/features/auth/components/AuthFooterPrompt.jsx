import { Link } from '@inertiajs/react';

export default function AuthFooterPrompt({ prompt, cta, href }) {
    if (!prompt || !cta || !href) {
        return null;
    }

    return (
        <div className="mt-8 text-center text-[15px] leading-7 text-slate-400">
            <p>{prompt}</p>
            <Link href={href} className="font-medium text-[#4285f4] hover:underline">
                {cta}
            </Link>
        </div>
    );
}
