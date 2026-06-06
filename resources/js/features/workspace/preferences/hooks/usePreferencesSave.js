import { createBackendResource, getBackendErrorMessage } from '@/features/workspace/backend/workspaceBackendApi';
import { extractPreferencesFromTabs } from '../preferenceMapping';
import { dismissToast, showErrorToast, showLoadingToast, showSuccessToast } from '@/components/feedback/toast';

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
                message: 'Nama Perusahaan wajib diisi.',
            });
            return;
        }
        if (values['email'] !== undefined && !String(values['email'] ?? '').trim()) {
            showErrorToast({
                title: 'Data tidak valid',
                message: 'Email Perusahaan wajib diisi.',
            });
            return;
        }
        if (values['email'] !== undefined) {
            const emailStr = String(values['email'] ?? '').trim();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (emailStr && !emailRegex.test(emailStr)) {
                showErrorToast({
                    title: 'Data tidak valid',
                    message: 'Format email perusahaan tidak valid.',
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
            const payload = {
                company_info: values,
                settings: {
                    ...values,
                    ...extractPreferencesFromTabs(Object.values(tabsData).flat())
                }
            };

            await createBackendResource('preferences', payload);
            setIsDirty(false);
            dismissToast(loadingToastId);
            showSuccessToast({
                title: 'Berhasil',
                message: 'Preferensi berhasil disimpan.',
            });
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
