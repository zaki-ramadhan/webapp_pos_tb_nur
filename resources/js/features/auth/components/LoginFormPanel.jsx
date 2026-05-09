import { Link } from '@inertiajs/react';

import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import AuthInput from '@/features/auth/components/AuthInput';
import AuthFooterPrompt from '@/features/auth/components/AuthFooterPrompt';
import AuthHeading from '@/features/auth/components/AuthHeading';
import LocaleSwitcher from '@/features/auth/components/LocaleSwitcher';
import PasswordField from '@/features/auth/components/PasswordField';
import SocialButton from '@/features/auth/components/SocialButton';

export default function LoginFormPanel({ locale, login }) {
    return (
        <div className="flex h-full flex-col px-5 py-5 sm:px-8 sm:py-7 xl:px-10 xl:py-8">
            <div className="flex justify-end">
                <LocaleSwitcher {...locale} />
            </div>

            <div className="mx-auto flex w-full max-w-[442px] flex-1 flex-col justify-center">
                <AuthHeading brand={login.brand} title={login.title} subtitle={login.subtitle} />

                <form className="mt-6 space-y-4 sm:mt-8" onSubmit={(event) => event.preventDefault()}>
                    <AuthInput label={login.identifierLabel} />
                    <PasswordField label={login.passwordLabel} />

                    <div className="text-right">
                        <Link href="#" className="text-[15px] text-[#4285f4] hover:underline">
                            {login.forgotPassword}
                        </Link>
                    </div>

                    <Button as={Link} href={login.submitHref} fullWidth>
                        {login.submitLabel}
                    </Button>

                    <div className="pt-3">
                        <Divider label={login.socialDivider} />
                    </div>

                    <SocialButton label={login.googleLabel} />
                </form>

                <AuthFooterPrompt
                    prompt={login.signupPrompt}
                    cta={login.signupCta}
                    href={login.signupHref}
                />
            </div>
        </div>
    );
}
