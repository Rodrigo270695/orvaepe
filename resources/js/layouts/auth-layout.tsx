import AuthOrvaeLoginLayout from '@/layouts/auth/auth-orvae-login-layout';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    maxWidthClass?: string;
}) {
    return (
        <AuthOrvaeLoginLayout title={title} description={description} {...props}>
            {children}
        </AuthOrvaeLoginLayout>
    );
}
