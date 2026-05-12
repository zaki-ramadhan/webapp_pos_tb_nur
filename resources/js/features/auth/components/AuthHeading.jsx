import BrandMark from '@/features/auth/components/BrandMark';
import SectionHeading from '@/components/ui/SectionHeading';

export default function AuthHeading({ title, subtitle }) {
    return (
        <div className="text-center">
            <BrandMark variant="decorative" className="justify-center" />
            <SectionHeading title={title} subtitle={subtitle} className="mt-5" />
        </div>
    );
}
