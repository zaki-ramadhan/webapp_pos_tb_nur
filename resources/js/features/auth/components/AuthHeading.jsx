import BrandMark from '@/features/auth/components/BrandMark';
import SectionHeading from '@/components/ui/SectionHeading';

export default function AuthHeading({ brand, title, subtitle }) {
    return (
        <div className="text-center">
            <BrandMark name={brand} />
            <SectionHeading title={title} subtitle={subtitle} className="mt-6" />
        </div>
    );
}
