export function extractPreferencesFromTabs(tabs = []) {
    const preferences = {};

    tabs.forEach(tab => {
        if (tab.sections) {
            tab.sections.forEach(section => {
                if (section.items) {
                    section.items.forEach(item => {
                        preferences[item.id] = item.checked;
                    });
                }
                if (section.textItems) {
                    section.textItems.forEach(item => {
                        // text items usually don't have values unless they are inputs
                        if (item.value !== undefined) {
                            preferences[item.id] = item.value;
                        }
                    });
                }
            });
        }
        if (tab.rows) {
            tab.rows.forEach(row => {
                if (row.type === 'radio') {
                    preferences[row.id] = row.value;
                } else if (row.type === 'checkbox-list') {
                    row.options.forEach(opt => {
                        preferences[`${row.id}:${opt.id}`] = opt.checked;
                    });
                } else if (row.type === 'single-checkbox') {
                    preferences[row.id] = row.option?.checked;
                } else if (row.controls) {
                    row.controls.forEach(ctrl => {
                        preferences[ctrl.id] = ctrl.value;
                    });
                }
            });
        }
    });

    return preferences;
}
