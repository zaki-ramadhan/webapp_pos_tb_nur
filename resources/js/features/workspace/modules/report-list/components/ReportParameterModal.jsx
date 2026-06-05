import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ModalBase from '@/components/ui/ModalBase';
import { showInfoToast } from '@/components/feedback/toast';
import {
    ReportDateField,
    ReportBranchField,
    ReportCheckboxList,
    getTodayString,
    getFirstDayOfMonthString
} from './ReportParameterFields';
import { resolveReportParams } from '@/features/workspace/modules/report-list/utils/reportHelpers';
import CheckboxField from '@/components/ui/CheckboxField';

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
        <ModalBase open={open} onBackdropClick={onClose} panelClassName="max-w-xl">
            <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800 line-clamp-1">
                        Parameter Laporan — {report.title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('umum')}
                        className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'umum'
                                ? 'border-[#ef3968] text-[#ef3968]'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Umum
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('kolom')}
                        className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'kolom'
                                ? 'border-[#ef3968] text-[#ef3968]'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Kolom
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleTampilkan} className="flex-1 overflow-y-auto p-5 space-y-4">
                    {activeTab === 'umum' ? (
                        <div className="space-y-4">
                            {/* Date Field */}
                            {reportSchema && (
                                <ReportDateField
                                    type={reportSchema.dateType}
                                    value={params}
                                    onChange={handleDateChange}
                                />
                            )}

                            {/* Branch Field */}
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
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-slate-500">
                                Kolom default laporan ini akan ditampilkan secara otomatis. Anda dapat menyesuaikan tampilan kolom di bawah ini:
                            </p>
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                <CheckboxField id="col-default-1" label="Tanggal / Periode" checked disabled />
                                <CheckboxField id="col-default-2" label="Nomor Dokumen" checked disabled />
                                <CheckboxField id="col-default-3" label="Keterangan" checked disabled />
                                <CheckboxField id="col-default-4" label="Nominal / Nilai" checked disabled />
                                <CheckboxField id="col-default-5" label="Cabang" checked disabled />
                                <CheckboxField id="col-default-6" label="Akun Terkait" checked disabled />
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 px-4 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        onClick={handleTampilkan}
                        className="h-10 px-5 text-sm font-medium text-white bg-[#ef3968] hover:bg-[#d6305a] rounded-md shadow-sm transition-colors"
                    >
                        Tampilkan
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
