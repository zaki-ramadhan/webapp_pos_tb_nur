import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Pencil } from 'lucide-react';
import ModalBase from '@/components/ui/ModalBase';
import CheckboxField from '@/components/ui/CheckboxField';
import { showInfoToast } from '@/components/feedback/toast';
import { showPromptModal } from '@/components/ui/promptModal';
import {
    ReportDateField,
    ReportBranchField,
    ReportCheckboxList,
    ReportSectionHeading,
    getTodayString,
    getFirstDayOfMonthString
} from './ReportParameterFields';
import { resolveReportParams, resolveReportColumns } from '@/features/workspace/modules/report-list/utils/reportHelpers';
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
        branch: null,
        branchId: null,
        checkboxes: {}
    });

    // State pengelolaan kolom
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [selectedColumnId, setSelectedColumnId] = useState(null);
    const [showAddMenu, setShowAddMenu] = useState(false);

    const reportSchema = report ? resolveReportParams(report.id, report.categoryId) : null;
    const colSchema = report ? resolveReportColumns(report.id, report.categoryId) : { mandatory: [], optional: [] };
    
    const availableOptionalColumns = colSchema.optional.filter(
        opt => !visibleColumns.some(vc => vc.id === opt.id)
    );

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
            branch: null,
            branchId: null,
            checkboxes: initialCheckboxes
        });
        setActiveTab('umum');

        // Inisialisasi kolom laporan
        const cols = resolveReportColumns(report.id, report.categoryId);
        setVisibleColumns(
            cols.mandatory.map(c => ({ ...c, isMandatory: true, checked: true }))
        );
        setSelectedColumnId(null);
        setShowAddMenu(false);
    }, [report, open]);

    if (!report) return null;

    const handleSelectBranch = (record) => {
        setParams(prev => ({
            ...prev,
            branch: record,
            branchId: record?.id ?? null
        }));
    };

    const handleRemoveBranch = () => {
        setParams(prev => ({
            ...prev,
            branch: null,
            branchId: null
        }));
    };

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

    const handleToggleColumn = (id, checked) => {
        setVisibleColumns(prev => prev.map(c => c.id === id ? { ...c, checked } : c));
    };

    const handleSelectColumn = (id) => {
        setSelectedColumnId(id);
    };

    const handleAddColumn = (column) => {
        setVisibleColumns(prev => [
            ...prev,
            { ...column, isMandatory: false, checked: true }
        ]);
        setShowAddMenu(false);
    };

    const handleDeleteColumn = () => {
        if (!selectedColumnId) return;
        const col = visibleColumns.find(c => c.id === selectedColumnId);
        if (col && col.isMandatory) return;

        setVisibleColumns(prev => prev.filter(c => c.id !== selectedColumnId));
        setSelectedColumnId(null);
    };

    const handleEditColumn = async () => {
        if (!selectedColumnId) return;
        const col = visibleColumns.find(c => c.id === selectedColumnId);
        if (col && col.isMandatory) return;

        const result = await showPromptModal("Ubah Nama Kolom", [
            {
                name: 'newLabel',
                label: 'Nama Kolom',
                type: 'text',
                defaultValue: col.label,
                required: true,
            },
        ]);

        if (result && result.newLabel.trim()) {
            setVisibleColumns(prev => prev.map(c => c.id === selectedColumnId ? { ...c, label: result.newLabel.trim() } : c));
        }
    };

    const handleTampilkan = (e) => {
        e.preventDefault();

        // Simulasi buat laporan
        showInfoToast({
            title: 'Laporan sedang disiapkan',
            message: `Menyiapkan ${report.title}...`
        });

        if (onSubmit) {
            onSubmit({
                ...params,
                columns: visibleColumns.filter(c => c.checked).map(c => c.id)
            });
        }

        onClose();
    };

    return (
        <ModalBase open={open} onBackdropClick={onClose} panelClassName="max-w-xl !bg-transparent !shadow-none !overflow-visible flex flex-col max-h-[90vh] sm:max-h-[85vh]">
            <div className="flex flex-col h-full bg-white rounded-[16px] sm:rounded-[12px] overflow-hidden border border-[#0d386c]/20 shadow-2xl">
                {}
                <div className="flex items-center justify-between px-5 py-2.5 bg-[#0d386c] text-white">
                    <h2 className="text-sm font-medium tracking-wide">
                        Parameter Laporan
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {}
                <div className="flex border-b border-slate-200 bg-white">
                    <button
                        type="button"
                        onClick={() => setActiveTab('umum')}
                        className={`flex-1 py-2 text-center text-xs font-medium border-b-2 transition-colors ${
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
                        className={`flex-1 py-2 text-center text-xs font-medium border-b-2 transition-colors ${
                            activeTab === 'kolom'
                                ? 'border-[#e31a1a] text-[#e31a1a]'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Kolom
                    </button>
                </div>

                {}
                <form onSubmit={handleTampilkan} className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
                    {activeTab === 'umum' ? (
                        <div className="space-y-3">
                            {}
                            <ReportSectionHeading title="Tanggal" />
                            {reportSchema && (
                                <ReportDateField
                                    type={reportSchema.dateType}
                                    value={params}
                                    onChange={handleDateChange}
                                />
                            )}

                            {}
                            <ReportSectionHeading title="Parameter Tambahan" />
                            {reportSchema?.hasBranch && (
                                <ReportBranchField
                                    value={params.branch}
                                    onSelect={handleSelectBranch}
                                    onRemove={handleRemoveBranch}
                                />
                            )}

                            {}
                            {reportSchema?.checkboxes && reportSchema.checkboxes.length > 0 && (
                                <ReportCheckboxList
                                    list={reportSchema.checkboxes}
                                    values={params.checkboxes}
                                    onChange={handleCheckboxChange}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <ReportSectionHeading title="Parameter Kolom" />
                            
                            <div className="border border-slate-300 rounded-[4px] bg-white h-[200px] overflow-y-auto mt-2 select-none shadow-inner divide-y divide-slate-100">
                                {visibleColumns.map((col) => {
                                    const isSelected = selectedColumnId === col.id;
                                    return (
                                        <div
                                            key={col.id}
                                            onClick={() => handleSelectColumn(col.id)}
                                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                                                isSelected ? 'bg-blue-50/70 text-blue-900' : 'hover:bg-slate-50 text-slate-800'
                                            }`}
                                        >
                                            <CheckboxField
                                                id={`col-chk-${col.id}`}
                                                label={col.label}
                                                checked={col.checked}
                                                disabled={col.isMandatory}
                                                onChange={(e) => handleToggleColumn(col.id, e.target.checked)}
                                                containerClassName="w-full"
                                                labelClassName={isSelected ? 'text-blue-900 font-medium' : 'text-slate-800'}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {}
                            <div className="relative flex items-center gap-1.5 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowAddMenu(prev => !prev)}
                                    className="inline-flex items-center justify-center h-[34px] w-[34px] rounded-[4px] bg-[#5cb85c] hover:bg-[#4cae4c] text-white shadow-sm transition-colors active:bg-[#449d44]"
                                    title="Tambah Kolom"
                                >
                                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                                </button>
                                <button
                                    type="button"
                                    disabled={!selectedColumnId || visibleColumns.find(c => c.id === selectedColumnId)?.isMandatory}
                                    onClick={handleEditColumn}
                                    className="inline-flex items-center justify-center h-[34px] w-[34px] rounded-[4px] bg-white border border-slate-300 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:bg-[#f4f4f4] disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    title="Ubah Kolom"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    disabled={!selectedColumnId || visibleColumns.find(c => c.id === selectedColumnId)?.isMandatory}
                                    onClick={handleDeleteColumn}
                                    className="inline-flex items-center justify-center h-[34px] w-[34px] rounded-[4px] bg-white border border-slate-300 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:bg-[#f4f4f4] disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    title="Hapus Kolom"
                                >
                                    <Minus className="h-5 w-5" strokeWidth={2.5} />
                                </button>

                                {}
                                {showAddMenu && (
                                    <div className="absolute left-0 bottom-[40px] z-20 w-[240px] bg-white border border-slate-200 rounded-[4px] shadow-lg py-1 max-h-[160px] overflow-y-auto">
                                        {availableOptionalColumns.length > 0 ? (
                                            availableOptionalColumns.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => handleAddColumn(opt)}
                                                    className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                                                >
                                                    {opt.label}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-slate-400 italic">
                                                Semua kolom sudah ditambahkan
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </form>

                {}
                <div className="flex items-center justify-end px-5 py-2.5 border-t border-slate-200 bg-white">
                    <button
                        type="submit"
                        onClick={handleTampilkan}
                        className="h-8 px-4 text-xs font-medium text-white bg-[#154c9f] hover:bg-[#0d386c] rounded-[4px] shadow-sm transition-colors active:bg-[#0b2d5a]"
                    >
                        Tampilkan
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
