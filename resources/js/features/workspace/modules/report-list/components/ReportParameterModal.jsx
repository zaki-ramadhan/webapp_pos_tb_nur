import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Pencil } from 'lucide-react';
import ModalBase from '@/components/ui/ModalBase';
import CheckboxField from '@/components/ui/CheckboxField';
import { showInfoToast } from '@/components/feedback/toast';
import {
    ReportDateField,
    ReportBranchField,
    ReportCheckboxList,
    ReportSectionHeading,
    getTodayString,
    getFirstDayOfMonthString
} from './ReportParameterFields';
import { resolveReportParams } from '@/features/workspace/modules/report-list/utils/reportHelpers';

export default function ReportParameterModal({ report, open, onClose, onSubmit }) {
    const [activeTab, setActiveTab] = useState('umum');
    const [params, setParams] = useState({
        startDate: getFirstDayOfMonthString(),
        endDate: getTodayString(),
        singleDate: getTodayString(),
        startPeriodMonth: String(new Date().getMonth() + 1),
        startPeriodYear: String(new Date().getFullYear()),
        endPeriodMonth: String(new Date().getMonth() + 1),
        endPeriodYear: String(new Date().getFullYear()),
        checkboxes: {}
    });

    const reportSchema = report ? resolveReportParams(report.id, report.categoryId) : null;

    useEffect(() => {
        if (!report || !open) return;

        const schema = resolveReportParams(report.id, report.categoryId);
        const initialCheckboxes = {};
        if (schema.checkboxes) {
            schema.checkboxes.forEach(key => {
                initialCheckboxes[key] = false;
            });
        }

        setParams({
            startDate: getFirstDayOfMonthString(),
            endDate: getTodayString(),
            singleDate: getTodayString(),
            startPeriodMonth: String(new Date().getMonth() + 1),
            startPeriodYear: String(new Date().getFullYear()),
            endPeriodMonth: String(new Date().getMonth() + 1),
            endPeriodYear: String(new Date().getFullYear()),
            checkboxes: initialCheckboxes
        });
        setActiveTab('umum');
    }, [report, open]);

    if (!report) return null;

    const handleCheckboxChange = (nextCheckboxes) => {
        setParams(prev => ({
            ...prev,
            checkboxes: nextCheckboxes
        }));
    };

    const handleDateChange = (nextDates) => {
        setParams(prev => ({
            ...prev,
            ...nextDates
        }));
    };

    const handleTampilkan = (e) => {
        e.preventDefault();

        // Simulate report generation
        showInfoToast({
            title: 'Laporan sedang disiapkan',
            message: `Menyiapkan ${report.title}...`
        });

        if (onSubmit) {
            onSubmit(params);
        }

        onClose();
    };

    return (
        <ModalBase open={open} onBackdropClick={onClose} panelClassName="max-w-xl !bg-transparent !shadow-none !overflow-visible flex flex-col max-h-[90vh] sm:max-h-[85vh]">
            <div className="flex flex-col h-full bg-white rounded-[16px] sm:rounded-[12px] overflow-hidden border border-[#0d386c]/20 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d386c] text-white">
                    <h2 className="text-[16px] font-medium tracking-wide">
                        Parameter Laporan
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 bg-white">
                    <button
                        type="button"
                        onClick={() => setActiveTab('umum')}
                        className={`flex-1 py-2.5 text-center text-[14px] font-medium border-b-2 transition-colors ${
                            activeTab === 'umum'
                                ? 'border-[#e31a1a] text-[#e31a1a]'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Umum
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('kolom')}
                        className={`flex-1 py-2.5 text-center text-[14px] font-medium border-b-2 transition-colors ${
                            activeTab === 'kolom'
                                ? 'border-[#e31a1a] text-[#e31a1a]'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Kolom
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleTampilkan} className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
                    {activeTab === 'umum' ? (
                        <div className="space-y-4">
                            {/* Date Field */}
                            <ReportSectionHeading title="Tanggal" />
                            {reportSchema && (
                                <ReportDateField
                                    type={reportSchema.dateType}
                                    value={params}
                                    onChange={handleDateChange}
                                />
                            )}

                            {/* Parameter Tambahan */}
                            <ReportSectionHeading title="Parameter Tambahan" />
                            {reportSchema?.hasBranch && <ReportBranchField />}

                            {/* Checkbox Parameters */}
                            {reportSchema?.checkboxes && reportSchema.checkboxes.length > 0 && (
                                <ReportCheckboxList
                                    list={reportSchema.checkboxes}
                                    values={params.checkboxes}
                                    onChange={handleCheckboxChange}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <ReportSectionHeading title="Parameter Kolom" />
                            
                            <div className="border border-slate-300 rounded-[4px] bg-white h-[200px] overflow-y-auto p-3.5 space-y-2 mt-2 select-none shadow-inner">
                                <CheckboxField id="col-default-1" label="Tanggal / Periode" checked disabled />
                                <CheckboxField id="col-default-2" label="Nomor Dokumen" checked disabled />
                                <CheckboxField id="col-default-3" label="Keterangan" checked disabled />
                                <CheckboxField id="col-default-4" label="Nominal / Nilai" checked disabled />
                                <CheckboxField id="col-default-5" label="Cabang" checked disabled />
                                <CheckboxField id="col-default-6" label="Akun Terkait" checked disabled />
                            </div>

                            {/* Action Buttons below listbox */}
                            <div className="flex items-center gap-1.5 pt-1">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center h-[34px] w-[34px] rounded-[4px] bg-[#5cb85c] hover:bg-[#4cae4c] text-white shadow-sm transition-colors"
                                    title="Tambah Kolom"
                                >
                                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                                </button>
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center justify-center h-[34px] w-[34px] rounded-[4px] bg-[#f4f4f4] border border-slate-200 text-slate-400 cursor-not-allowed"
                                    title="Ubah Kolom"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex items-center justify-center h-[34px] w-[34px] rounded-[4px] bg-[#f4f4f4] border border-slate-200 text-slate-400 cursor-not-allowed"
                                    title="Hapus Kolom"
                                >
                                    <Minus className="h-5 w-5" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end px-5 py-3.5 border-t border-slate-200 bg-white">
                    <button
                        type="submit"
                        onClick={handleTampilkan}
                        className="h-10 px-6 text-[15px] font-semibold text-white bg-[#154c9f] hover:bg-[#0d386c] rounded-[4px] shadow-sm transition-colors active:bg-[#0b2d5a]"
                    >
                        Tampilkan
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
