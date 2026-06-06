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
