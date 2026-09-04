import { router } from '@inertiajs/react';
import { createBackendResource, getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import { extractPreferencesFromTabs } from '../preferenceMapping';
import { dismissToast, showErrorToast, showLoadingToast, showSuccessToast } from '@/components/feedback/toast';
import { normalizePhoneNumber } from '@/features/workspace/shared/phoneFormatting';

export default function usePreferencesSave(
    values,
    tabsData,
    setIsDirty,
    saving,
    setSaving,
    reload
) {
    const handleSave = async () => {
        if (values['company-name'] !== undefined && !String(values['company-name'] ?? '').trim()) {
            showErrorToast({
                title: 'Data tidak valid',
                message: 'Nama Toko wajib diisi.',
            });
            return;
        }
        if (values['email'] !== undefined && !String(values['email'] ?? '').trim()) {
            showErrorToast({
                title: 'Data tidak valid',
                message: 'Email Toko wajib diisi.',
            });
            return;
        }
        if (values['email'] !== undefined) {
            const emailStr = String(values['email'] ?? '').trim();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (emailStr && !emailRegex.test(emailStr)) {
                showErrorToast({
                    title: 'Data tidak valid',
                    message: 'Format email toko tidak valid.',
                });
                return;
            }
        }

        setSaving(true);
        const loadingToastId = showLoadingToast({
            title: 'Memproses',
            message: 'Sedang menyimpan preferensi.',
        });
        try {
            const cleanedValues = { ...values };
            if (cleanedValues['phone']) {
                cleanedValues['phone'] = normalizePhoneNumber(cleanedValues['phone']);
            }
            if (cleanedValues['fax']) {
                cleanedValues['fax'] = normalizePhoneNumber(cleanedValues['fax']);
            }

            const payload = {
                company_info: cleanedValues,
                settings: {
                    ...cleanedValues,
                    ...extractPreferencesFromTabs(Object.values(tabsData).filter(Boolean).flat())
                }
            };

            await createBackendResource('preferences', payload);
            setIsDirty(false);
            dismissToast(loadingToastId);
            showSuccessToast({
                title: 'Berhasil',
                message: 'Preferensi berhasil disimpan.',
            });
            router.reload();
            reload();
        } catch (error) {
            console.error('Save failed:', error);
            dismissToast(loadingToastId);
            showErrorToast({
                title: 'Gagal menyimpan',
                message: getBackendErrorMessage(error),
            });
        } finally {
            setSaving(false);
        }
    };

    return handleSave;
}
