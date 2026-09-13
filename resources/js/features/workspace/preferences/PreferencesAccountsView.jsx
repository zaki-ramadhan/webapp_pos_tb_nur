import React, { useState } from 'react';
import PreferencesTabPanel from '@/features/workspace/preferences/PreferencesTabPanel';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { buildAccountLookupLabel } from '@/features/workspace/shared/AccountLookupControls';

export const DEFAULT_ACCOUNTS_PREFERENCES = {
    // Barang & Jasa
    'accounts-items-inventory': [
        '[115.000-01] Persediaan Handphone',
        '[115.000-02] Persediaan Sparepart Handphone',
        '[115.000-03] Persediaan Assesoris Handphone',
        '[115.000-98] Persediaan Dalam Proses',
    ],
    'accounts-items-sales': [
        '[411.000-01] Penjualan Handphone',
        '[411.000-02] Penjualan Sparepart Handphone',
        '[411.000-03] Penjualan Assesoris Handphone',
        '[411.000-99] Pendapatan Jasa',
    ],
    'accounts-items-sales-return': [
        '[431.000-01] Retur Penjualan Handphone',
        '[431.000-02] Retur Penjualan Sparepart Handphone',
    ],
    'accounts-items-sales-discount': [
        '[421.000-01] Potongan Penjualan Handphone',
        '[421.000-02] Potongan Penjualan Sparepart Handphone',
        '[421.000-03] Potongan Penjualan Assesoris Handphone',
        '[421.000-99] Potongan Pendapatan Jasa',
    ],
    'accounts-items-goods-delivered': [
        '[115.000-99] Barang Terkirim',
    ],
    'accounts-items-cogs': [
        '[511.000-01] Beban Pokok Penjualan Handphone',
        '[511.000-02] Beban Pokok Penjualan Sparepart Handphone',
        '[511.000-03] Beban Pokok Penjualan Assesoris Handphone',
        '[511.000-04] Beban Perakitan',
    ],
    'accounts-items-purchase-return': [
        '[115.000-01] Persediaan Handphone',
        '[115.000-02] Persediaan Sparepart Handphone',
        '[115.000-03] Persediaan Assesoris Handphone',
    ],
    'accounts-items-expense': [
        '[611.001-04] Beban Angkut Pembelian',
        '[611.001-13] Beban Perbaikan dan Perawatan Alat',
        '[611.002-99] Beban Umum & Admin Lainnya',
        '[611.002-09] Beban Rumah Tangga Kantor',
    ],
    'accounts-items-uninvoiced-purchase': [
        '[213.000-99] Penerimaan Belum Tertagih',
    ],

    // Toko
    'accounts-company-opening-equity': '[300001] Equitas Saldo Awal',
    'accounts-company-retained-earnings': '[311.000-04] Laba ditahan',
    'accounts-company-income-tax': [
        '[711.000-04] Beban Pajak Penghasilan',
    ],
    'accounts-company-pph21-payable': [
        '[215.000-02] Hutang Pajak PPh Ps 21',
    ],
    'accounts-company-pension-payable': [
        '[214.100-04] BYMD - BPJS Ketenagakerjaan Jakarta',
        '[214.200-04] BYMD - BPJS Ketenagakerjaan Surabaya',
    ],
    'accounts-company-health-payable': [
        '[214.100-03] BYMD - BPJS Kesehatan Jakarta',
        '[214.200-03] BYMD - BPJS Kesehatan Surabaya',
    ],
    'accounts-company-employee-receivable': [],
    'accounts-company-interest-receivable': [],
    'accounts-company-unearned-interest': [],
    'accounts-company-interest-income': [],
    'accounts-company-fine-income': [],

    // Penjualan/Pembelian
    'accounts-sales-purchase-discount': [
        '[421.000-01] Potongan Penjualan Handphone',
        '[421.000-02] Potongan Penjualan Sparepart Handphone',
        '[421.000-03] Potongan Penjualan Assesoris Handphone',
        '[421.000-99] Potongan Pendapatan Jasa',
        '[422.000-01] Potongan Penjualan IDR',
        '[422.000-02] Potongan Penjualan USD',
        '[422.000-03] Potongan Penjualan SGD',
        '[512.000-01] Potongan Pembelian Handphone',
        '[512.000-02] Potongan Pembelian Sparepart Handphone',
        '[512.000-03] Potongan Pembelian Assesoris Handphone',
    ],
    'accounts-purchase-invoice-rounding': '[711.000-99] Biaya Diluar Usaha Lainnya',

    // Persediaan
    'accounts-inventory-adjustment': [
        '[300001] Equitas Saldo Awal',
        '[711.000-98] Biaya Selisih Penyesuaian Persediaan',
    ],
    'accounts-inventory-stock-opname-variance': [],
    'accounts-inventory-job-order': [
        '[115.000-98] Persediaan Dalam Proses',
    ],
    'accounts-inventory-job-order-variance': [
        '[711.000-97] Biaya Selisih Pembiayaan Pesanan',
    ],
};

const ACCOUNT_SUB_TABS = [
    { id: 'items-services', label: 'Barang & Jasa' },
    { id: 'store', label: 'Toko' },
    { id: 'sales-purchase', label: 'Penjualan/Pembelian' },
    { id: 'inventory', label: 'Persediaan' },
];

function AccountFieldRow({
    label,
    fieldId,
    values,
    onChange,
    multi = true,
    placeholder = 'Cari/Pilih...',
    disabled = false,
    note = null,
}) {
    const rawValue = values[fieldId] !== undefined ? values[fieldId] : DEFAULT_ACCOUNTS_PREFERENCES[fieldId];
    const currentList = multi
        ? (Array.isArray(rawValue) ? rawValue : (rawValue ? [rawValue] : []))
        : undefined;
    const currentSingle = !multi
        ? (typeof rawValue === 'string' ? rawValue : (Array.isArray(rawValue) && rawValue.length > 0 ? rawValue[0] : ''))
        : undefined;

    return (
        <div className="grid gap-x-4 gap-y-2 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
            <div className="pt-2 text-xs sm:text-sm text-text-contrast">
                <span>{label}</span>
            </div>
            <div className="w-full max-w-[430px]">
                <BackendLookupField
                    resource="accounts"
                    multi={multi}
                    fullWidthChips={multi}
                    value={currentSingle}
                    values={currentList}
                    placeholder={placeholder}
                    searchLabel={`Cari ${label}`}
                    getOptionLabel={buildAccountLookupLabel}
                    disabled={disabled}
                    onSelect={(account) => {
                        const optLabel = buildAccountLookupLabel(account);
                        if (multi) {
                            const existing = currentList || [];
                            if (!existing.includes(optLabel)) {
                                onChange(fieldId, [...existing, optLabel]);
                            }
                        } else {
                            onChange(fieldId, optLabel);
                        }
                    }}
                    onRemove={(removed) => {
                        const optLabel = typeof removed === 'string' ? removed : buildAccountLookupLabel(removed);
                        if (multi) {
                            const existing = currentList || [];
                            onChange(fieldId, existing.filter((item) => item !== optLabel));
                        } else {
                            onChange(fieldId, '');
                        }
                    }}
                    onClear={() => {
                        onChange(fieldId, multi ? [] : '');
                    }}
                />
                {note ? (
                    <p className="mt-1.5 text-xs italic text-red-500 leading-relaxed">
                        {note}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

export default function PreferencesAccountsView({ values = {}, onChange, readOnly = false }) {
    const [activeTabId, setActiveTabId] = useState('items-services');

    return (
        <PreferencesTabPanel
            tabs={ACCOUNT_SUB_TABS}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            panelClassName="max-w-[760px] space-y-6"
            activeTabClassName="font-medium text-tab-active-text"
        >
            {activeTabId === 'items-services' && (
                <div className="space-y-6">
                    <div>
                        <PreferencesSectionHeading icon="inventory" title="Barang & Jasa" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Persediaan" fieldId="accounts-items-inventory" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Penjualan" fieldId="accounts-items-sales" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Retur Penjualan" fieldId="accounts-items-sales-return" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Diskon Penjualan" fieldId="accounts-items-sales-discount" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Barang Terkirim" fieldId="accounts-items-goods-delivered" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Beban Pokok Penjualan" fieldId="accounts-items-cogs" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Retur Pembelian" fieldId="accounts-items-purchase-return" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Beban" fieldId="accounts-items-expense" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Pembelian Belum Tertagih" fieldId="accounts-items-uninvoiced-purchase" values={values} onChange={onChange} disabled={readOnly} />
                        </div>
                    </div>
                </div>
            )}

            {activeTabId === 'store' && (
                <div className="space-y-6">
                    <div>
                        <PreferencesSectionHeading icon="ledger" title="Neraca" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Ekuitas Saldo Awal" fieldId="accounts-company-opening-equity" values={values} onChange={onChange} multi={false} disabled={readOnly} />
                            <AccountFieldRow label="Laba Ditahan" fieldId="accounts-company-retained-earnings" values={values} onChange={onChange} multi={false} disabled={readOnly} />
                        </div>
                    </div>

                    <div>
                        <PreferencesSectionHeading icon="tax" title="Laba/Rugi" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Pajak Penghasilan" fieldId="accounts-company-income-tax" values={values} onChange={onChange} disabled={readOnly} />
                        </div>
                    </div>

                    <div>
                        <PreferencesSectionHeading icon="employee" title="Penggajian Karyawan" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Utang PPh21" fieldId="accounts-company-pph21-payable" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Utang Premi Pensiun" fieldId="accounts-company-pension-payable" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Utang Premi Kesehatan" fieldId="accounts-company-health-payable" values={values} onChange={onChange} disabled={readOnly} />
                        </div>
                    </div>

                    <div>
                        <PreferencesSectionHeading icon="employee" title="Peminjaman Karyawan" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Piutang Karyawan" fieldId="accounts-company-employee-receivable" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Piutang Bunga" fieldId="accounts-company-interest-receivable" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Pendapatan Bunga Dimuka" fieldId="accounts-company-unearned-interest" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Pendapatan Bunga" fieldId="accounts-company-interest-income" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Pendapatan Denda" fieldId="accounts-company-fine-income" values={values} onChange={onChange} disabled={readOnly} />
                        </div>
                    </div>
                </div>
            )}

            {activeTabId === 'sales-purchase' && (
                <div className="space-y-6">
                    <div>
                        <PreferencesSectionHeading icon="payment" title="Penerimaan/Pembayaran" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Akun Diskon" fieldId="accounts-sales-purchase-discount" values={values} onChange={onChange} disabled={readOnly} />
                        </div>
                    </div>

                    <div>
                        <PreferencesSectionHeading icon="purchases" title="Faktur Pembelian" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow
                                label="Akun Pembulatan"
                                fieldId="accounts-purchase-invoice-rounding"
                                values={values}
                                onChange={onChange}
                                multi={false}
                                disabled={readOnly}
                                note="Digunakan untuk menampung nilai pembulatan pajak (Inclusive Tax) dan pembulatan nilai biaya barang akibat diskon/alokasi nilai biaya pembelian"
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTabId === 'inventory' && (
                <div className="space-y-6">
                    <div>
                        <PreferencesSectionHeading icon="stock" title="Penyesuaian Persediaan" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Akun Penyesuaian" fieldId="accounts-inventory-adjustment" values={values} onChange={onChange} disabled={readOnly} />
                        </div>
                    </div>

                    <div>
                        <PreferencesSectionHeading icon="inventory" title="Perintah Stok Opname" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Beban Selisih Stok" fieldId="accounts-inventory-stock-opname-variance" values={values} onChange={onChange} placeholder="Cari/Pilih Akun Perkiraan..." disabled={readOnly} />
                        </div>
                    </div>

                    <div>
                        <PreferencesSectionHeading icon="box" title="Pekerjaan Pesanan" />
                        <div className="space-y-4 pt-4">
                            <AccountFieldRow label="Akun Pekerjaan" fieldId="accounts-inventory-job-order" values={values} onChange={onChange} disabled={readOnly} />
                            <AccountFieldRow label="Selisih Biaya" fieldId="accounts-inventory-job-order-variance" values={values} onChange={onChange} disabled={readOnly} />
                        </div>
                    </div>
                </div>
            )}
        </PreferencesTabPanel>
    );
}
