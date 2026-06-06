export default function usePreferencesSectionHandlers(updateActiveTab, isNested = false) {
    function updateActiveTabRows(updater) {
        if (isNested) {
            updateActiveTab((tab) => ({
                ...tab,
                sections: (tab.sections ?? []).map((section) => ({
                    ...section,
                    rows: updater(section.rows ?? []),
                })),
            }));
        } else {
            updateActiveTab((tab) => ({
                ...tab,
                rows: updater(tab.rows ?? []),
            }));
        }
    }

    function handleChangeRadio(rowId, value) {
        updateActiveTabRows((rows) =>
            rows.map((row) => (row.id === rowId ? { ...row, value } : row)),
        );
    }

    function handleToggleSingle(rowId, checked) {
        updateActiveTabRows((rows) =>
            rows.map((row) =>
                row.id === rowId && row.option
                    ? {
                          ...row,
                          option: {
                              ...row.option,
                              checked,
                          },
                      }
                    : row,
            ),
        );
    }

    function handleChangeControl(rowId, value) {
        updateActiveTabRows((rows) =>
            rows.map((row) =>
                row.id === rowId && row.control
                    ? {
                          ...row,
                          control: {
                              ...row.control,
                              value,
                          },
                      }
                    : row,
            ),
        );
    }

    function handleChangeNestedControl(rowId, controlId, value) {
        updateActiveTabRows((rows) =>
            rows.map((row) =>
                row.id === rowId
                    ? {
                          ...row,
                          controls: (row.controls ?? []).map((control) =>
                              control.id === controlId ? { ...control, value } : control,
                          ),
                      }
                    : row,
            ),
        );
    }

    function handleToggleOption(rowId, optionId, checked) {
        updateActiveTabRows((rows) =>
            rows.map((row) =>
                row.id === rowId
                    ? {
                          ...row,
                          options: (row.options ?? []).map((option) =>
                              option.id === optionId ? { ...option, checked } : option,
                          ),
                      }
                    : row,
            ),
        );
    }

    return {
        handleChangeRadio,
        handleToggleSingle,
        handleChangeControl,
        handleChangeNestedControl,
        handleToggleOption,
    };
}
