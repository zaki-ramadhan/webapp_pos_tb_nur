import AuthCarouselPanel from '@/features/auth/components/AuthCarouselPanel';
import AuthPanelShell from '@/features/auth/components/AuthPanelShell';
import LoginFormPanel from '@/features/auth/components/LoginFormPanel';
import AuthLayout from '@/layouts/AuthLayout';

export default function HomePage({ carousel, login }) {
    return (
        <AuthLayout title="Login">
            <AuthPanelShell
                left={<AuthCarouselPanel carousel={carousel} />}
                right={<LoginFormPanel login={login} />}
            />
        </AuthLayout>
    );
}
