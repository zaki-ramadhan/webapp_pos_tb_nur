import AuthCarouselPanel from '@/features/auth/components/AuthCarouselPanel';
import AuthPanelShell from '@/features/auth/components/AuthPanelShell';
import ResetPasswordFormPanel from '@/features/auth/components/ResetPasswordFormPanel';
import AuthLayout from '@/layouts/AuthLayout';

export default function ResetPasswordPage({ carousel, resetPassword }) {
    return (
        <AuthLayout title="Reset Password">
            <AuthPanelShell
                left={<AuthCarouselPanel carousel={carousel} />}
                right={<ResetPasswordFormPanel resetPassword={resetPassword} />}
            />
        </AuthLayout>
    );
}
