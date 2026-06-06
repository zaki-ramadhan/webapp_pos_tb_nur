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

export function mergeValuesIntoTabs(tabsData = {}, values = {}) {
    if (!values || Object.keys(values).length === 0) {
        return tabsData;
    }

    const nextTabsData = {};
    Object.keys(tabsData).forEach(key => {
        const tabs = tabsData[key] ?? [];
        nextTabsData[key] = tabs.map(tab => {
            const nextTab = { ...tab };
            
            if (tab.sections) {
                nextTab.sections = tab.sections.map(section => {
                    const nextSection = { ...section };
                    
                    if (section.items) {
                        nextSection.items = section.items.map(item => {
                            if (values[item.id] !== undefined) {
                                const dbVal = values[item.id];
                                const checked = dbVal === true || dbVal === 'true' || dbVal === 1 || dbVal === '1';
                                return { ...item, checked };
                            }
                            return item;
                        });
                    }

                    if (section.radioItems) {
                        nextSection.radioItems = section.radioItems.map(item => {
                            if (values[item.id] !== undefined) {
                                const dbVal = values[item.id];
                                const checked = dbVal === true || dbVal === 'true' || dbVal === 1 || dbVal === '1';
                                return { ...item, checked };
                            }
                            return item;
                        });
                    }
                    
                    if (section.textItems) {
                        nextSection.textItems = section.textItems.map(item => {
                            if (values[item.id] !== undefined) {
                                return { ...item, value: values[item.id] };
                            }
                            return item;
                        });
                    }

                    if (section.rows) {
                        nextSection.rows = section.rows.map(row => {
                            const nextRow = { ...row };
                            if (row.type === 'radio' || row.type === 'radio-group' || row.type === 'advanced-radio-group') {
                                if (values[row.id] !== undefined) {
                                    nextRow.value = values[row.id];
                                }
                                if (row.options) {
                                    nextRow.options = row.options.map(opt => {
                                        const nextOpt = { ...opt };
                                        if (opt.blocks) {
                                            nextOpt.blocks = opt.blocks.map(block => {
                                                const nextBlock = { ...block };
                                                if (block.type === 'timing-rule') {
                                                    const chkKey = `${block.id}:checked`;
                                                    if (values[chkKey] !== undefined) {
                                                        const dbVal = values[chkKey];
                                                        const checked = dbVal === true || dbVal === 'true' || dbVal === 1 || dbVal === '1';
                                                        nextBlock.option = { ...block.option, checked };
                                                    }
                                                    if (values[`${block.id}:beforeValue`] !== undefined) {
                                                        nextBlock.beforeValue = values[`${block.id}:beforeValue`];
                                                    }
                                                    if (values[`${block.id}:beforeUnit`] !== undefined) {
                                                        nextBlock.beforeUnit = values[`${block.id}:beforeUnit`];
                                                    }
                                                    if (values[`${block.id}:afterValue`] !== undefined) {
                                                        nextBlock.afterValue = values[`${block.id}:afterValue`];
                                                    }
                                                    if (values[`${block.id}:afterUnit`] !== undefined) {
                                                        nextBlock.afterUnit = values[`${block.id}:afterUnit`];
                                                    }
                                                } else if (block.type === 'search-row') {
                                                    if (values[block.id] !== undefined) {
                                                        nextBlock.control = { ...block.control, value: values[block.id] };
                                                    }
                                                } else if (block.type === 'nested-radio-group') {
                                                    if (values[block.id] !== undefined) {
                                                        nextBlock.value = values[block.id];
                                                    }
                                                }
                                                return nextBlock;
                                            });
                                        }
                                        return nextOpt;
                                    });
                                }
                            } else if (row.type === 'checkbox-list') {
                                if (row.options) {
                                    nextRow.options = row.options.map(opt => {
                                        const dbKey = `${row.id}:${opt.id}`;
                                        if (values[dbKey] !== undefined) {
                                            const dbVal = values[dbKey];
                                            const checked = dbVal === true || dbVal === 'true' || dbVal === 1 || dbVal === '1';
                                            return { ...opt, checked };
                                        }
                                        return opt;
                                    });
                                }
                                if (row.items) {
                                    nextRow.items = row.items.map(item => {
                                        const dbKey = `${row.id}:${item.id}`;
                                        if (values[dbKey] !== undefined) {
                                            const dbVal = values[dbKey];
                                            const checked = dbVal === true || dbVal === 'true' || dbVal === 1 || dbVal === '1';
                                            return { ...item, checked };
                                        }
                                        return item;
                                    });
                                }
                            } else if (row.type === 'single-checkbox' || row.type === 'inline-checkbox') {
                                if (row.option && values[row.id] !== undefined) {
                                    const dbVal = values[row.id];
                                    const checked = dbVal === true || dbVal === 'true' || dbVal === 1 || dbVal === '1';
                                    nextRow.option = { ...row.option, checked };
                                }
                            } else if (row.type === 'lookup-block') {
                                if (row.control && values[row.id] !== undefined) {
                                    nextRow.control = { ...row.control, value: values[row.id] };
                                }
                            } else if (row.type === 'field') {
                                if (row.control && values[row.control.id] !== undefined) {
                                    nextRow.control = { ...row.control, value: values[row.control.id] };
                                }
                                if (row.controls) {
                                    nextRow.controls = row.controls.map(ctrl => {
                                        if (values[ctrl.id] !== undefined) {
                                            return { ...ctrl, value: values[ctrl.id] };
                                        }
                                        return ctrl;
                                    });
                                }
                            } else if (row.controls) {
                                nextRow.controls = row.controls.map(ctrl => {
                                    if (values[ctrl.id] !== undefined) {
                                        return { ...ctrl, value: values[ctrl.id] };
                                    }
                                    return ctrl;
                                });
                            }
                            return nextRow;
                        });
                    }
                    
                    return nextSection;
                });
            }
            
            if (tab.rows) {
                nextTab.rows = tab.rows.map(row => {
                    const nextRow = { ...row };
                    
                    if (row.type === 'radio' || row.type === 'radio-group' || row.type === 'advanced-radio-group') {
                        if (values[row.id] !== undefined) {
                            nextRow.value = values[row.id];
                        }
                    } else if (row.type === 'checkbox-list') {
                        if (row.options) {
                            nextRow.options = row.options.map(opt => {
                                const dbKey = `${row.id}:${opt.id}`;
                                if (values[dbKey] !== undefined) {
                                    const dbVal = values[dbKey];
                                    const checked = dbVal === true || dbVal === 'true' || dbVal === 1 || dbVal === '1';
                                    return { ...opt, checked };
                                }
                                return opt;
                            });
                        }
                        if (row.items) {
                            nextRow.items = row.items.map(item => {
                                const dbKey = `${row.id}:${item.id}`;
                                if (values[dbKey] !== undefined) {
                                    const dbVal = values[dbKey];
                                    const checked = dbVal === true || dbVal === 'true' || dbVal === 1 || dbVal === '1';
                                    return { ...item, checked };
                                }
                                return item;
                            });
                        }
                    } else if (row.type === 'single-checkbox' || row.type === 'inline-checkbox') {
                        if (row.option && values[row.id] !== undefined) {
                            const dbVal = values[row.id];
                            const checked = dbVal === true || dbVal === 'true' || dbVal === 1 || dbVal === '1';
                            nextRow.option = { ...row.option, checked };
                        }
                    } else if (row.type === 'lookup-block') {
                        if (row.control && values[row.id] !== undefined) {
                            nextRow.control = { ...row.control, value: values[row.id] };
                        }
                    } else if (row.type === 'field') {
                        if (row.control && values[row.control.id] !== undefined) {
                            nextRow.control = { ...row.control, value: values[row.control.id] };
                        }
                        if (row.controls) {
                            nextRow.controls = row.controls.map(ctrl => {
                                if (values[ctrl.id] !== undefined) {
                                    return { ...ctrl, value: values[ctrl.id] };
                                }
                                return ctrl;
                            });
                        }
                    } else if (row.controls) {
                        nextRow.controls = row.controls.map(ctrl => {
                            if (values[ctrl.id] !== undefined) {
                                return { ...ctrl, value: values[ctrl.id] };
                            }
                            return ctrl;
                        });
                    }
                    
                    return nextRow;
                });
            }
            
            return nextTab;
        });
    });
    
    return nextTabsData;
}
