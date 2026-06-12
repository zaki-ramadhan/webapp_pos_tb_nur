import Tooltip from '@/components/ui/Tooltip';
import { CloseIcon, InfoIcon } from '@/features/workspace/shared/Icons';
import { GroupAccessUserLookupField } from './GroupAccessControls';
import RadioField from '@/components/ui/RadioField';

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
                                <InfoIcon className="h-[18px] w-[18px] text-[#2f374d] cursor-help" />
                            </Tooltip>
                        ) : null}
                    </span>
                }
                inputClassName="h-5 w-5 border-[#c7d0df]"
                containerClassName="w-auto inline-flex items-center"
            />
            {checked && children}
        </div>
    );
}

export function GroupAccessGeneralSection({
    general,
    values,
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
            <div className="grid gap-y-6 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-start">
                <label htmlFor={general.nameField?.id} className="pt-2 text-xs sm:text-sm text-[#20273b]">
                    {general.nameField?.label} <span className="text-[#ED3969]">*</span>
                </label>
                <div className="max-w-[580px]">
                    <TextInputComponent
                        id={general.nameField?.id}
                        value={values.groupName}
                        onChange={(event) => onChangeName(event.target.value)}
                        trailing={
                            general.nameField?.clearable ? <CloseIcon className="h-[18px] w-[18px] text-[#2f374d]" /> : null
                        }
                        className="h-[40px] rounded-[4px] border-[#7fb0ee] shadow-[0_0_0_3px_rgba(127,176,238,0.12)]"
                        inputClassName="text-xs sm:text-sm text-[#1f2436]"
                    />
                </div>

                <div className="pt-2 text-xs sm:text-sm text-[#20273b]">{general.accessLimitations?.label}</div>
                <div className="flex flex-col gap-4 pt-1">
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
                                    <div className="pl-[32px] flex flex-col gap-2 mt-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <select
                                                value={values.accessLimitDays}
                                                onChange={(e) => onChangeAccessLimitDays(e.target.value)}
                                                className="h-[38px] rounded-[5px] border border-[#cfd6e2] bg-white px-3 text-xs sm:text-sm text-[#1f2436] outline-none focus:border-[#5a84e5] cursor-pointer"
                                            >
                                                <option value="Senin-Jumat">Senin-Jumat</option>
                                                <option value="Senin-Sabtu">Senin-Sabtu</option>
                                                <option value="Setiap Hari">Setiap Hari</option>
                                            </select>

                                            <span className="text-xs sm:text-sm text-[#20273b]">Jam</span>

                                            <select
                                                value={values.accessLimitStartHour}
                                                onChange={(e) => onChangeAccessLimitStartHour(e.target.value)}
                                                className="h-[38px] w-[70px] rounded-[5px] border border-[#cfd6e2] bg-white px-2 text-xs sm:text-sm text-[#1f2436] outline-none focus:border-[#5a84e5] cursor-pointer"
                                            >
                                                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((hour) => (
                                                    <option key={hour} value={hour}>{hour}</option>
                                                ))}
                                            </select>

                                            <span className="text-xs sm:text-sm text-[#20273b]">-</span>

                                            <select
                                                value={values.accessLimitEndHour}
                                                onChange={(e) => onChangeAccessLimitEndHour(e.target.value)}
                                                className="h-[38px] w-[70px] rounded-[5px] border border-[#cfd6e2] bg-white px-2 text-xs sm:text-sm text-[#1f2436] outline-none focus:border-[#5a84e5] cursor-pointer"
                                            >
                                                {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((hour) => (
                                                    <option key={hour} value={hour}>{hour}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm italic text-[#e15263] border-l-2 border-[#cfd6e2] pl-2.5 py-0.5 leading-none">
                                            Waktu Jakarta - Indonesia
                                        </div>
                                    </div>
                                )}
                            </GroupAccessAccessOption>
                        );
                    })}
                </div>

                <div className="pt-2 text-xs sm:text-sm text-[#20273b]">{general.userSelection?.label}</div>
                <GroupAccessUserLookupField
                    field={general.userSelection}
                    selectedUsers={values.selectedUsers}
                    onAddUser={onAddUser}
                    onRemoveUser={onRemoveUser}
                />
            </div>
        </div>
    );
}
