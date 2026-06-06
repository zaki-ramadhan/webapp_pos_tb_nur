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
                if (section.radioItems) {
                    section.radioItems.forEach(item => {
                        preferences[item.id] = item.checked;
                    });
                }
                if (section.textItems) {
                    section.textItems.forEach(item => {
                        if (item.value !== undefined) {
                            preferences[item.id] = item.value;
                        }
                    });
                }
                if (section.rows) {
                    section.rows.forEach(row => {
                        if (row.type === 'radio' || row.type === 'radio-group' || row.type === 'advanced-radio-group') {
                            preferences[row.id] = row.value;
                            if (row.options) {
                                row.options.forEach(opt => {
                                    if (opt.blocks) {
                                        opt.blocks.forEach(block => {
                                            if (block.type === 'timing-rule') {
                                                preferences[`${block.id}:checked`] = block.option?.checked;
                                                preferences[`${block.id}:beforeValue`] = block.beforeValue;
                                                preferences[`${block.id}:beforeUnit`] = block.beforeUnit;
                                                preferences[`${block.id}:afterValue`] = block.afterValue;
                                                preferences[`${block.id}:afterUnit`] = block.afterUnit;
                                            } else if (block.type === 'search-row') {
                                                preferences[block.id] = block.control?.value;
                                            } else if (block.type === 'nested-radio-group') {
                                                preferences[block.id] = block.value;
                                            }
                                        });
                                    }
                                });
                            }
                        } else if (row.type === 'checkbox-list') {
                            if (row.options) {
                                row.options.forEach(opt => {
                                    preferences[`${row.id}:${opt.id}`] = opt.checked;
                                });
                            }
                            if (row.items) {
                                row.items.forEach(item => {
                                    preferences[`${row.id}:${item.id}`] = item.checked;
                                });
                            }
                        } else if (row.type === 'single-checkbox' || row.type === 'inline-checkbox') {
                            preferences[row.id] = row.option?.checked;
                        } else if (row.type === 'lookup-block') {
                            preferences[row.id] = row.control?.value;
                        } else if (row.type === 'field') {
                            if (row.control) {
                                preferences[row.control.id] = row.control.value;
                            }
                            if (row.controls) {
                                row.controls.forEach(ctrl => {
                                    preferences[ctrl.id] = ctrl.value;
                                });
                            }
                        } else if (row.controls) {
                            row.controls.forEach(ctrl => {
                                preferences[ctrl.id] = ctrl.value;
                            });
                        }
                    });
                }
            });
        }
        if (tab.rows) {
            tab.rows.forEach(row => {
                if (row.type === 'radio' || row.type === 'radio-group' || row.type === 'advanced-radio-group') {
                    preferences[row.id] = row.value;
                } else if (row.type === 'checkbox-list') {
                    if (row.options) {
                        row.options.forEach(opt => {
                            preferences[`${row.id}:${opt.id}`] = opt.checked;
                        });
                    }
                    if (row.items) {
                        row.items.forEach(item => {
                            preferences[`${row.id}:${item.id}`] = item.checked;
                        });
                    }
                } else if (row.type === 'single-checkbox' || row.type === 'inline-checkbox') {
                    preferences[row.id] = row.option?.checked;
                } else if (row.type === 'lookup-block') {
                    preferences[row.id] = row.control?.value;
                } else if (row.type === 'field') {
                    if (row.control) {
                        preferences[row.control.id] = row.control.value;
                    }
                    if (row.controls) {
                        row.controls.forEach(ctrl => {
                            preferences[ctrl.id] = ctrl.value;
                        });
                    }
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
