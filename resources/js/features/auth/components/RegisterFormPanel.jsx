import { Link } from '@inertiajs/react';

import Button from '@/components/ui/Button';
import CheckboxField from '@/components/ui/CheckboxField';
import FormField from '@/components/ui/FormField';
import TextInput from '@/components/ui/TextInput';
import AuthFooterPrompt from '@/features/auth/components/AuthFooterPrompt';
import AuthHeading from '@/features/auth/components/AuthHeading';
import AuthInput from '@/features/auth/components/AuthInput';
import LocaleSwitcher from '@/features/auth/components/LocaleSwitcher';
import PasswordField from '@/features/auth/components/PasswordField';

function NameField({ prefix, label }) {
    return (
        <FormField label={label}>
            <TextInput prefix={prefix} />
        </FormField>
    );
}

function TermsCheckbox({ label, termsLinkLabel, privacyLinkLabel }) {
    return (
        <CheckboxField label={`${label} `}>
            <>
                <Link href="#" className="text-[#4285f4] hover:underline">
                    {termsLinkLabel}
                </Link>{' '}
                dan{' '}
                <Link href="#" className="text-[#4285f4] hover:underline">
                    {privacyLinkLabel}
                </Link>
            </>
        </CheckboxField>
    );
}

export default function RegisterFormPanel({ locale, register }) {
    return (
        <div className="flex h-full flex-col px-5 py-5 sm:px-8 sm:py-7 xl:px-10 xl:py-8">
            <div className="flex justify-end">
                <LocaleSwitcher {...locale} />
            </div>

            <div className="mx-auto flex w-full max-w-[442px] flex-1 flex-col justify-center">
                <AuthHeading
                    brand={register.brand}
                    title={register.title}
                    subtitle={register.subtitle}
                />

                <form className="mt-6 space-y-4 sm:mt-8" onSubmit={(event) => event.preventDefault()}>
                    <NameField prefix={register.namePrefix} label={register.nameLabel} />
                    <AuthInput label={register.emailLabel} />
                    <AuthInput label={register.phoneLabel} />
                    <PasswordField label={register.passwordLabel} />

                    <TermsCheckbox
                        label={register.termsLabel}
                        termsLinkLabel={register.termsLinkLabel}
                        privacyLinkLabel={register.privacyLinkLabel}
                    />

                    <Button type="submit" fullWidth>
                        {register.submitLabel}
                    </Button>
                </form>

                <AuthFooterPrompt
                    prompt={register.loginPrompt}
                    cta={register.loginCta}
                    href={register.loginHref}
                />
            </div>
        </div>
    );
}
