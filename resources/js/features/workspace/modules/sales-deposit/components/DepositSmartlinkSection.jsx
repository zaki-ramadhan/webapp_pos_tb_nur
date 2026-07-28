import { TransactionSectionHeading } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function DepositSmartlinkSection({ config }) {
    return (
        <section>
            <TransactionSectionHeading title={config.smartlinkTitle} icon="smartlink" />
            <div className="mt-4 flex items-start gap-4 text-base leading-8 text-brand-dark pl-3 sm:pl-5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-brand-dark">
                    i
                </span>
                <p className="max-w-[720px] italic">
                    Sekarang Anda dapat menerima pembayaran tagihan ini melalui partner Payment Gateway
                    <br />
                    kami. <span className="text-input-brand">Klik Disini</span>
                </p>
            </div>
        </section>
    );
}
