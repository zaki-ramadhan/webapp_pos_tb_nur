import AuthCarouselPanel from '@/features/auth/components/AuthCarouselPanel';
import AuthPanelShell from '@/features/auth/components/AuthPanelShell';
import RegisterFormPanel from '@/features/auth/components/RegisterFormPanel';
import AuthLayout from '@/layouts/AuthLayout';

export default function RegisterPage({ carousel, register }) {
    return (
        <AuthLayout title="Daftar">
            <AuthPanelShell
                left={<AuthCarouselPanel carousel={carousel} />}
                right={<RegisterFormPanel register={register} />}
            />
        </AuthLayout>
    );
}
