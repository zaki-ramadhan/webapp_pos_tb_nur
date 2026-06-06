import React from 'react';
import PreferencesSectionHeading from '@/features/workspace/preferences/PreferencesSectionHeading';
import {
    LimitationsSimpleRadioGroup,
    LimitationsAdvancedRadioGroup,
    LimitationsCheckboxList,
} from './LimitationsRadioGroup';

export function LimitationsSection({
    section,
    onChangeRadio,
    onChangeAdvancedRadio,
    onToggleTimingRule,
    onChangeTimingRule,
    onChangeNestedRadio,
    onToggleCheckboxItem,
}) {
    return (
        <section className="space-y-3.5">
            <PreferencesSectionHeading icon={section.icon} title={section.title} />

            <div className="space-y-2.5">
                {(section.rows ?? []).map((row) => {
                    if (row.type === 'advanced-radio-group') {
                        return (
                            <LimitationsAdvancedRadioGroup
                                key={row.id}
                                row={row}
                                onChange={onChangeAdvancedRadio}
                                onToggleTimingRule={onToggleTimingRule}
                                onChangeTimingRule={onChangeTimingRule}
                                onChangeNestedRadio={onChangeNestedRadio}
                            />
                        );
                    }

                    if (row.type === 'checkbox-list') {
                        return (
                            <LimitationsCheckboxList
                                key={row.id}
                                row={row}
                                onToggleItem={onToggleCheckboxItem}
                            />
                        );
                    }

                    return (
                        <LimitationsSimpleRadioGroup
                            key={row.id}
                            row={row}
                            onChange={onChangeRadio}
                        />
                    );
                })}
            </div>
        </section>
    );
}
