import Tooltip from '@/components/ui/Tooltip';
import { CloseIcon, InfoIcon } from '@/features/workspace/shared/Icons';
import { GroupAccessUserLookupField } from './GroupAccessControls';
import RadioField from '@/components/ui/RadioField';
import SelectField from '@/components/ui/SelectField';
import GroupAccessTimePicker from './components/GroupAccessTimePicker';

export function GroupAccessAccessOption({ option, checked, onChange, children }) {
    return (
        <div className="flex flex-col gap-2">
            <RadioField
                id={option.id}
                name="group-access-limitation"
                checked={checked}
                onChange={() => onChange(option.id)}
                label={
                    <span className="inline-flex items-center gap-2">
                        <span>{option.label}</span>
                        {option.info ? (
                            <Tooltip content="Membatasi waktu akses login pengguna ke sistem." portal>
                                <InfoIcon className="h-[18px] w-[18px] text-section-tab-neutral-text cursor-help" />
                            </Tooltip>
                        ) : null}
                    </span>
                }
                inputClassName="h-3.5 w-3.5 border-tab-view-active-border-x"
                containerClassName="w-auto inline-flex items-center"
            />
            {checked && children}
        </div>
    );
}

export function GroupAccessGeneralSection({
    general,
    values,
    currentGroupId = null,
    onChangeName,
    onChangeAccessLimitation,
    onChangeAccessLimitDays,
    onChangeAccessLimitStartHour,
    onChangeAccessLimitEndHour,
    onAddUser,
    onRemoveUser,
    textInput: TextInputComponent,
}) {
    return (
        <div>
            <div className="grid gap-y-3.5 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start">
                <label htmlFor={general.nameField?.id} className="pt-2 text-xs sm:text-sm text-section-tab-accent-text">
                    {general.nameField?.label} <span className="text-tab-active-border-t">*</span>
                </label>
                <div className="max-w-[430px] w-full">
                    <TextInputComponent
                        id={general.nameField?.id}
                        value={values.groupName}
                        onChange={(event) => onChangeName(event.target.value)}
                        trailing={
                            general.nameField?.clearable ? <CloseIcon className="h-[18px] w-[18px] text-section-tab-neutral-text" /> : null
                        }
                        className="h-[36px] rounded-[4px] border-brand-blue-border-light shadow-focus-blue-medium"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                </div>

                <div className="pt-1.5 text-xs sm:text-sm text-section-tab-accent-text">{general.accessLimitations?.label}</div>
                <div className="flex flex-col gap-2.5 pt-0.5">
                    {(general.accessLimitations?.options ?? []).map((option) => {
                        const isChecked = values.accessLimitationId === option.id;
                        return (
                            <GroupAccessAccessOption
                                key={option.id}
                                option={option}
                                checked={isChecked}
                                onChange={onChangeAccessLimitation}
                            >
                                {option.id === 'limited-time' && (
                                    <div className="pl-[32px] flex flex-col gap-3 mt-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs sm:text-sm text-section-tab-accent-text font-medium">Hari Akses:</span>
                                            <SelectField
                                                value={values.accessLimitDays}
                                                onChange={(e) => onChangeAccessLimitDays(e.target.value)}
                                                className="h-[36px] min-w-[140px] text-xs sm:text-sm text-brand-dark"
                                                containerClassName="w-auto"
                                            >
                                                <option value="Senin-Jumat">Senin-Jumat</option>
                                                <option value="Senin-Sabtu">Senin-Sabtu</option>
                                                <option value="Setiap Hari">Setiap Hari</option>
                                            </SelectField>
                                        </div>

                                        <GroupAccessTimePicker
                                            startHour={values.accessLimitStartHour}
                                            endHour={values.accessLimitEndHour}
                                            onChangeStartHour={onChangeAccessLimitStartHour}
                                            onChangeEndHour={onChangeAccessLimitEndHour}
                                        />
                                    </div>
                                )}
                            </GroupAccessAccessOption>
                        );
                    })}
                </div>

                <div className="pt-2 text-xs sm:text-sm text-section-tab-accent-text">{general.userSelection?.label}</div>
                <GroupAccessUserLookupField
                    field={general.userSelection}
                    selectedUsers={values.selectedUsers}
                    currentGroupId={currentGroupId}
                    onAddUser={onAddUser}
                    onRemoveUser={onRemoveUser}
                />
            </div>
        </div>
    );
}
