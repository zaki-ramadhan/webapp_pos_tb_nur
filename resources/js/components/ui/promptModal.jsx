import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import WorkspaceDialog from '@/components/ui/WorkspaceDialog';
import TextInput from '@/components/ui/TextInput';
import SelectField from '@/components/ui/SelectField';
import Button from '@/components/ui/Button';

function PromptModalContainer({ title, fields, resolve, onDestroy }) {
    const [open, setOpen] = useState(true);
    const [values, setValues] = useState(() => {
        const initial = {};
        fields.forEach(f => {
            initial[f.name] = f.defaultValue ?? '';
        });
        return initial;
    });

    const [errors, setErrors] = useState({});

    function handleClose() {
        setOpen(false);
        setTimeout(() => {
            resolve(null);
            onDestroy();
        }, 300);
    }

    function handleSave() {
        const nextErrors = {};
        fields.forEach(f => {
            if (f.required && !String(values[f.name] ?? '').trim()) {
                nextErrors[f.name] = `${f.label} wajib diisi.`;
            }
        });

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setOpen(false);
        setTimeout(() => {
            resolve(values);
            onDestroy();
        }, 300);
    }

    return (
        <WorkspaceDialog
            open={open}
            onClose={handleClose}
            title={title}
            maxWidthClassName="max-w-[480px]"
            footer={
                <div className="flex justify-end gap-2.5">
                    <Button onClick={handleClose} variant="secondary" size="md">Batal</Button>
                    <Button onClick={handleSave} variant="primary" size="md">Simpan</Button>
                </div>
            }
        >
            <div className="space-y-4">
                {fields.map(f => {
                    if (f.type === 'select') {
                        return (
                            <div key={f.name} className="space-y-1">
                                <label className="text-xs font-normal text-slate-700">{f.label}</label>
                                <SelectField
                                    value={values[f.name]}
                                    onChange={(e) => setValues(c => ({ ...c, [f.name]: e.target.value }))}
                                >
                                    {(f.options || []).map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </SelectField>
                            </div>
                        );
                    }

                    return (
                        <div key={f.name} className="space-y-1">
                            <label className="text-xs font-normal text-slate-700">{f.label}</label>
                            <TextInput
                                type={f.type ?? 'text'}
                                value={values[f.name]}
                                error={errors[f.name]}
                                onChange={(e) => setValues(c => ({ ...c, [f.name]: e.target.value }))}
                                inputClassName="text-xs"
                            />
                        </div>
                    );
                })}
            </div>
        </WorkspaceDialog>
    );
}

export function showPromptModal(title, fields) {
    return new Promise((resolve) => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const root = createRoot(div);

        function onDestroy() {
            root.unmount();
            div.remove();
        }

        root.render(
            <PromptModalContainer
                title={title}
                fields={fields}
                resolve={resolve}
                onDestroy={onDestroy}
            />
        );
    });
}
