import { Controller } from "react-hook-form";
import FormModel, { FormRef, PropsForm } from "../models/form.model";
import { recursiveReMapping, validationRules } from "../lib";
import { v4 } from "uuid";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import moment from "moment";
import addWeeks from 'date-fns/addWeeks';
import React, { useImperativeHandle, forwardRef, useState, useRef, useEffect } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';

const BgsDate = forwardRef(({
    name,
    item,
    formControl,
    formRef,
    apperance,
    showLabelShrink,
    showIcon,
    ...others
}: PropsForm, ref: any) => {
    if (name) {
        const { disabled, readOnly }: any = others || {};
        item = recursiveReMapping(formRef, disabled, readOnly, item[name] as any)
        useImperativeHandle(ref, () => {
            return {
                name,
                type: item.editorType,
                item,
                ...formRef
            }
        });
    }

    const { label, editorOptions, dataField = v4(), validationRules: validation = [], visible: visibleItem, editorType } = item;
    const labelVisible = typeof label?.visible === "undefined" ? true : label?.visible;
    const { control } = formControl;
    let { format, views, openTo, minDate, maxDate, mode = "date", disabled, prefix, readOnly, visible = visibleItem, suffix, showArrow = true, positionIcon = "right", onChange: onChangeOptions = () => { } } = editorOptions || {};

    const getWeeksAfter = (date: Date | null, amount: number) => {
        //maxDate={getWeeksAfter(value[0], 4)}  ----------- sample using if date range disable date, disablePast = false
        return date ? addWeeks(date, amount) : undefined;
    }

    return <div className="bgs-date w-100">
        <Controller
            name={dataField}
            control={control}
            rules={!visible || disabled || readOnly ? {} : validationRules(validation, item, formControl, formRef)}
            render={({
                field: { onChange, value, ref },
                fieldState: { invalid, error },
            }) => (
                <FormControl className="w-100" error={invalid} disabled={disabled}>
                    <DatePicker
                        showLabelShrink={showLabelShrink}
                        ref={ref}
                        format={format}
                        mode={mode as any}
                        value={value}
                        readOnly={readOnly}
                        disabled={disabled}
                        minDate={minDate}
                        maxDate={maxDate}
                        showArrow={showArrow}
                        suffix={suffix}
                        prefix={prefix}
                        invalid={invalid}
                        className={editorOptions?.className || ""}
                        positionIcon={positionIcon}
                        allowClear={editorOptions?.allowClear}
                        label={labelVisible ? <BgsLabel label={label} showIcon={showIcon} validation={validation} editorType={editorType} /> : ""}
                        onChange={(val: any) => {
                            onChange(val)
                            onChangeOptions({
                                value: formRef.getData(dataField),
                                data: null,
                                formRef
                            })
                        }}
                    />
                    <FormHelperText>{error?.message || label?.hint}</FormHelperText>
                </FormControl>
            )}
        />
    </div>
})

export default BgsDate;


import Icon from '@mui/material/Icon';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import Fade from '@mui/material/Fade';
import Menu from '@mui/material/Menu';

export type Variant = 'outlined' | 'filled' | 'standard';

interface DatePickerProps {
    value?: any;
    onChange?: (value: any) => any;
    label?: any;
    mode?: "date" | "datetime" | "time" | "daterange" | "month";
    format?: {
        display?: string;
        value?: string;
    }
    minDate?: Date | string | moment.Moment;
    maxDate?: Date | string | moment.Moment;
    apperance?: Variant;
    placeholder?: string;
    allowClear?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    showArrow?: boolean;
    positionIcon?: "left" | "right" | "none";
    suffix?: any;
    prefix?: any;
    className: string;
    ref: any;
    invalid: boolean;
    showLabelShrink: boolean
}

const formating = (mode: "date" | "datetime" | "time" | "daterange" | "month", value: any, type: "display" | "value" = "display") => {
    if (value) return value;

    switch (mode) {
        case "date":
            if (type === "display") return "DD MMM YYYY";
            if (type === "value") return "YYYY-MM-DD";
            break;
        case "datetime":
            if (type === "display") return "DD MMM YYYY HH:mm:ss";
            if (type === "value") return "YYYY-MM-DD HH:mm:ss";
            break;
        case "time":
            if (type === "display") return "HH:mm";
            if (type === "value") return "HH:mm";
            break;
        case "daterange":
            if (type === "display") return "DD MMM YYYY";
            if (type === "value") return "YYYY-MM-DD";
            break;
        case "month":
            if (type === "display") return "MMM YYYY";
            if (type === "value") return "YYYY-MM";
            break;
    }
}

function DatePicker({ showLabelShrink, invalid, ref, className = "", mode = "date", format = {}, minDate, maxDate, label, apperance, placeholder, value, onChange = () => { }, allowClear, readOnly, disabled, showArrow = true, positionIcon = "right", suffix, prefix }: DatePickerProps) {
    const [displayFormat] = useState<any>(formating(mode, format?.display));
    const [valueFormat] = useState<any>(formating(mode, format?.value, "value"));
    const [date, setDate] = useState<any>(value && mode === "datetime" ? moment(value, valueFormat).format("YYYY-MM-DD") : "");
    const [time, setTime] = useState<any>(value && mode === "datetime" ? moment(value, valueFormat).format("HH:mm:ss") : "");

    const onChangeDate = (value: any, close: Function) => {
        setDate(value)
        if (mode === "datetime" && !time) setTime("00:00:00")

        if (mode !== "datetime" && mode !== "daterange") {
            close()
            onChange(moment(value, valueFormat).format(valueFormat))
        }
        else if (mode === "daterange") {
            onChange(value)
        }
    }
    const onChangeTime = (value: any, close: Function) => {
        setTime(value)
        if (mode !== "datetime") {
            close()
            onChange(moment(value, valueFormat).format(valueFormat))
        }
    }

    const reformatToMoment = (value?: moment.Moment | Date | string) => {
        if (value) {
            if (typeof value === "string") return moment(value, valueFormat).format(displayFormat)
            else return moment(value).format(displayFormat)
        }
        return ""
    }

    const selectValue = (value: any) => {
        if (!value) return ""

        if (mode !== "daterange") {

            const val = moment(value, valueFormat);

            if (!val.isValid()) return value

            return val.format(displayFormat)
        }
        else {
            if (isArray(value, 0) && value.length === 2) return value.map(reformatToMoment).join(" - ")
            else return ""
        }
    }

    const today = (close: Function) => {
        close()
        onChange(moment().format(valueFormat));
    }

    const ok = (close: Function): any => {
        if (date && time) {

            if (minDate) if (moment(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss") < moment(minDate)) return bgsSnackbar({ message: `Min Date ${moment(minDate).format(displayFormat)}` })

            if (maxDate) if (moment(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss") > moment(maxDate)) return bgsSnackbar({ message: `Max Date ${moment(maxDate).format(displayFormat)}` })

            onChange(moment(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss").format(valueFormat));
            close();
        }
        else bgsSnackbar({ message: "Plesae select date and time" })
    }

    return <PopupState variant="popover">
        {(popupState) => (<>
            <TextField
                label={label}
                variant={apperance}
                size="small"
                inputRef={ref}
                error={invalid}
                placeholder={placeholder || mode === "daterange" ? `${displayFormat} - ${displayFormat}` : displayFormat}
                value={selectValue(value)}
                InputLabelProps={showLabelShrink ? {
                    shrink: true,
                } : {}}
                InputProps={{
                    className: `${className}`,
                    disabled,
                    style: {
                        paddingRight: 4,
                        paddingLeft: 0
                    },
                    inputProps: {
                        onClick: (e) => {
                            if (!disabled || !readOnly) bindTrigger(popupState).onClick(e);
                        },
                    },
                    readOnly: true,
                    ...(allowClear || (showArrow && positionIcon === "right") || suffix) ? {
                        endAdornment: (
                            <InputAdornment position="end">
                                {(allowClear && value && !disabled && !readOnly) && <BgsButton variant="icon" onClick={({ event }) => {
                                    popupState.close()
                                    event.preventDefault();
                                    // setValue("")
                                    setDate("")
                                    setTime("")
                                    onChange(null)
                                }}>
                                    <Icon baseClassName="material-icons-round">clear</Icon>
                                </BgsButton>}
                                {(showArrow && positionIcon === "right") && <BgsButton variant="icon" disabled={disabled || readOnly} onClick={(e) => {
                                    if (!disabled || !readOnly) bindTrigger(popupState).onClick(e.event)
                                }}>
                                    {mode === "time" ? <ScheduleRoundedIcon /> : <EventRoundedIcon />}
                                    {/* <Icon baseClassName="material-icons-round">{mode === "time" ? "schedule" : "event"}</Icon> */}
                                </BgsButton>}
                                {suffix}
                            </InputAdornment>
                        )
                    } : null,
                    ...((showArrow && positionIcon === "left") || prefix) ? {
                        startAdornment: (
                            <InputAdornment position="end">
                                {(showArrow && positionIcon === "left") && <BgsButton variant="icon" sx={{ ml: "-5px" }} disabled={disabled || readOnly} onClick={(e) => {
                                    if (!disabled || !readOnly) bindTrigger(popupState).onClick(e.event)
                                }}>
                                    {mode === "time" ? <ScheduleRoundedIcon /> : <EventRoundedIcon />}
                                    {/* <Icon baseClassName="material-icons-round">{mode === "time" ? "schedule" : "event"}</Icon> */}
                                </BgsButton>}
                                {prefix}
                            </InputAdornment>
                        )
                    } : null
                }}
            />
            <Menu
                {...bindPopover(popupState)}
                TransitionComponent={Fade}
                onClose={() => {
                    popupState.close();
                }}
                MenuListProps={{
                    style: {
                        padding: 0,
                        overflow: "hidden",
                        maxHeight: "453px"
                    }
                }}
            >
                <div className="row time-bgs" style={{ maxWidth: "670px" }}>
                    {(mode === "date" || mode === "datetime" || mode === "month") && <div className={`col-md-${mode === "datetime" ? "6 pe-0" : "12"} position-relative`}>
                        <BgsStaticDatePicker mode={mode} hide={popupState.close} minDate={minDate} maxDate={maxDate} displayFormat={displayFormat} valueFormat={valueFormat} value={value || ""} onChange={value => onChangeDate(value, popupState.close)} showInput={mode === "datetime"} />
                    </div>}
                    {(mode === "time" || mode === "datetime") && <div className={`col-md-${mode === "datetime" ? "6 ps-0" : "12"} position-relative`} style={{ backgroundColor: "#e6e6e6", borderRadius: "0px 0px 0px 15px" }}>
                        <BgsStaticTimePicker isNow={date ? moment(date, valueFormat).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") : false} minDate={minDate} maxDate={maxDate} valueFormat={valueFormat} value={value} onChange={value => onChangeTime(value, popupState.close)} showInput={mode === "datetime"} />
                    </div>}
                    {mode === "datetime" && <div className="col-md-12 m-0 p-0">
                        <div className="row m-0 p-0">
                            <div className="col-md-12 p-3 ps-4 pe-4">
                                <div className="row">
                                    <div className="col-md-6">
                                        <BgsButton variant="outlined" onClick={() => today(popupState.close)}>Today</BgsButton>
                                    </div>
                                    <div className="col-md-6 text-end">
                                        <BgsButton className="me-2" onClick={() => ok(popupState.close)}>OK</BgsButton>
                                        <BgsButton variant="text" onClick={() => popupState.close()}>Cancel</BgsButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
                    {mode === "daterange" && <>
                        <BgsDateRange mode={mode} hide={popupState.close} minDate={minDate} maxDate={maxDate} displayFormat={displayFormat} valueFormat={valueFormat} value={value || ""} onChange={value => onChangeDate(value, popupState.close)} />
                    </>}
                </div>
            </Menu>
        </>)}
    </PopupState>

}

import Paper from "@mui/material/Paper";

interface BgsStaticDatePickerProps {
    hide: Function;
    value?: null | moment.Moment | Date | string;
    onChange?: (value: null | moment.Moment | Date | string) => void;
    displayFormat?: string;
    valueFormat?: string;
    minDate?: moment.Moment | Date | string;
    maxDate?: moment.Moment | Date | string;
    disabledDates?: (moment.Moment | Date | string)[];
    showInput: boolean;
    mode: "date" | "datetime" | "time" | "daterange" | "month"
}

const BgsStaticDatePicker = ({ mode, valueFormat = "YYYY-MM-DD", onChange = () => { }, value, minDate, maxDate, disabledDates = [], showInput }: BgsStaticDatePickerProps) => {
    const formatValue = "YYYY-MM";
    const [selectedStart, setSelectedStart] = useState<moment.Moment | null | undefined>(value ? moment(value, showInput ? "YYYY-MM-DD" : valueFormat) : null)
    const [hover, setHover] = useState<moment.Moment | null | undefined>()
    const [month] = useState<moment.Moment>(value ? moment(value, showInput ? "YYYY-MM-DD" : valueFormat) : moment())

    const reformatToMoment = (value?: moment.Moment | Date | string): moment.Moment | null => {
        if (value) {
            if (typeof value === "string") return moment(value, valueFormat)
            else return moment(value)
        }
        return null
    }

    return <Grid container columns={2}>
        <Grid item xs={2}>
            <div className="p-2">
                <DateComponent mode={mode} valueFormat={valueFormat} isMultiple={false} disabledDates={disabledDates.length ? disabledDates.map(reformatToMoment) : []} minDate={reformatToMoment(minDate)} maxDate={reformatToMoment(maxDate)} month={month} formatValue={formatValue} selectedStart={selectedStart}
                    setSelectedStart={(value) => (setSelectedStart(value), onChange(value ? moment(value).format(showInput ? "YYYY-MM-DD" : valueFormat) : null))}
                    selectedEnd={null} setSelectedEnd={() => { }} canSelectEnd={false} setCanSelectedEnd={() => { }} hover={hover} setHover={setHover} />
            </div>
        </Grid>
    </Grid>
}


import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import BgsForm from "./form";
import BgsButton from "./button";
import bgsSnackbar from "../snackbar/snackbar";

interface BgsStaticTimePickerProps {
    onChange: (value: any) => any;
    value: any;
    showInput: boolean;
    valueFormat: string;
    minDate?: Date | string | moment.Moment;
    maxDate?: Date | string | moment.Moment;
    isNow?: boolean;
}

export function BgsStaticTimePicker({ onChange, showInput, value: valueDefault, valueFormat, minDate, maxDate, isNow }: BgsStaticTimePickerProps) {
    const [value, setValue] = useState<any>(valueDefault ? moment(valueDefault, valueFormat) : "");
    const formRef = useRef<FormRef>(null);

    useEffect(() => {
        formRef.current?.updateData({
            hours: value ? moment(value).format("HH") : "00",
            minutes: value ? moment(value).format("mm") : "00",
            seconds: value ? moment(value).format("ss") : "00"
        })
    }, [value])

    const form: FormModel = {
        colCount: valueFormat.split(":").length,
        items: [{
            dataField: "hours",
            editorOptions: {
                type: "number",
                className: "no-label-input",
                minNumber: 0,
                maxNumber: 23,
                onChange: ({ value = "00", formRef }) => {
                    const { minutes = "00", seconds = "00" } = formRef.getData();
                    const val = moment(`${value}:${minutes}:${seconds}`, "HH:mm:ss");
                    setValue(val)
                    if (showInput) onChange(val.format("HH:mm:ss"));
                },
                onClick: () => {
                    const btn: any = document.getElementsByClassName("MuiTimePickerToolbar-hourMinuteLabel")[0].children[0];
                    btn.click()
                }
            }
        }, {
            visible: valueFormat.split(":").length > 1,
            dataField: "minutes",
            editorOptions: {
                type: "number",
                className: "no-label-input",
                minNumber: 0,
                maxNumber: 59,
                onChange: ({ value = "00", formRef }) => {
                    const { hours = "00", seconds = "00" } = formRef.getData();
                    const val = moment(`${hours}:${value}:${seconds}`, "HH:mm:ss")
                    setValue(val)
                    if (showInput) onChange(val.format("HH:mm:ss"));
                },
                onClick: () => {
                    const btn: any = document.getElementsByClassName("MuiTimePickerToolbar-hourMinuteLabel")[0].children[2];
                    btn.click()
                }
            }
        }, {
            visible: valueFormat.split(":").length > 2,
            dataField: "seconds",
            editorOptions: {
                type: "number",
                className: "no-label-input",
                minNumber: 0,
                maxNumber: 59,
                onChange: ({ value = "00", formRef }) => {
                    const { hours = "00", minutes = "00" } = formRef.getData();
                    const val = moment(`${hours}:${minutes}:${value}`, "HH:mm:ss")
                    setValue(val)
                    if (showInput) onChange(val.format("HH:mm:ss"));
                },
                onClick: () => {
                    const btn: any = document.getElementsByClassName("MuiTimePickerToolbar-hourMinuteLabel")[0].children[4];
                    btn.click()
                }
            }
        }]
    }

    const reformatToMoment = (value?: moment.Moment | Date | string) => {
        if (value) {
            if (typeof value === "string") return new Date(moment(value, valueFormat).toString())
            else return new Date(moment(value).toString())
        }
        return null
    }

    return (
        <div className={`position-relative ${showInput ? " datetime-bgs pt-4 " : " pt-4 bg-white"}`}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <StaticTimePicker
                    ampm={false}
                    displayStaticWrapperAs="desktop"
                    openTo="hours"
                    minTime={showInput ? (isNow ? reformatToMoment(minDate) : undefined) : reformatToMoment(minDate)}
                    maxTime={showInput ? (isNow ? reformatToMoment(maxDate) : undefined) : reformatToMoment(maxDate)}
                    showToolbar={true}
                    views={valueFormat.split(":").length > 2 ? ['hours', 'minutes', 'seconds'] : ['hours', 'minutes']}
                    value={value}
                    onChange={(newValue: any) => {
                        setValue(newValue);
                        const btnNext: any = document.getElementsByClassName("MuiPickersArrowSwitcher-root")[0].children[2];

                        if (showInput && newValue) return onChange(moment(newValue).format("HH:mm:ss"));

                        if (btnNext.disabled && newValue) onChange(moment(newValue).format(valueFormat));
                    }}
                    renderInput={(params: any) => <TextField {...params} />}
                />
            </LocalizationProvider>
            <Paper className="p-2 br-0 ps-5 pe-5 shadow-none" sx={{ maxWidth: "320px" }}>
                <BgsForm ref={formRef} {...form} className="w-100 no-label-floating" />
            </Paper>
            {!showInput && <>
                <hr className="p-0 m-0 mt-2" />
                <div className="bg-white p-3 text-end">
                    <BgsButton variant="outlined" onClick={() => {
                        // onChange(moment(value).format(valueFormat))
                        onChange(moment(value, valueFormat).format(valueFormat))
                    }}>OK</BgsButton>
                </div>
            </>}
        </div>
    );
}

import Grid from "@mui/material/Grid";
import { Children } from "react";

interface BgsDateRangeProps {
    hide: Function;
    value?: (moment.Moment | Date | string)[];
    onChange?: (value: null | (moment.Moment | Date | string)[]) => void;
    displayFormat?: string;
    valueFormat?: string;
    minDate?: moment.Moment | Date | string;
    maxDate?: moment.Moment | Date | string;
    disabledDates?: (moment.Moment | Date | string)[];
    mode: "date" | "datetime" | "time" | "daterange" | "month"
}

const BgsDateRange = ({ mode, valueFormat = "YYYY-MM-DD", displayFormat = "DD MMM YYYY", onChange = () => { }, value, hide, minDate, maxDate, disabledDates = [] }: BgsDateRangeProps) => {
    const formatValue = "YYYY-MM";

    const reformatToMoment = (value?: moment.Moment | Date | string): moment.Moment | null => {
        if (value) {
            if (typeof value === "string") return moment(value, valueFormat)
            else return moment(value)
        }
        return null
    }

    const [selectedStart, setSelectedStart] = useState<moment.Moment | null | undefined>(value ? reformatToMoment(value[0]) : null)
    const [selectedEnd, setSelectedEnd] = useState<moment.Moment | null | undefined>(value ? reformatToMoment(value[1]) : null)
    const [canSelectEnd, setCanSelectedEnd] = useState<boolean>(false)
    const [hover, setHover] = useState<moment.Moment | null | undefined>()
    const [month] = useState<moment.Moment>(value ? reformatToMoment(value[0]) as any : moment())

    useEffect(() => {
        if (selectedStart && selectedEnd) {
            onChange([selectedStart.format(valueFormat), selectedEnd.format(valueFormat)])
        }
        else onChange(null)
    }, [selectedStart, selectedEnd])

    return <Grid container columns={2}>
        <Grid item xs={2}>
            <div className="p-2">
                <DateComponent mode={mode} valueFormat={valueFormat} disabledDates={disabledDates.length ? disabledDates.map(reformatToMoment) : []} minDate={reformatToMoment(minDate)} maxDate={reformatToMoment(maxDate)} month={month} formatValue={formatValue} selectedStart={selectedStart} setSelectedStart={setSelectedStart} selectedEnd={selectedEnd} setSelectedEnd={value => (setSelectedEnd(value), canSelectEnd && value && selectedStart && hide())} canSelectEnd={canSelectEnd} setCanSelectedEnd={setCanSelectedEnd} hover={hover} setHover={setHover} />
            </div>
        </Grid>
        {/* <Grid item xs={1} sx={{ borderLeft: "2px solid #e6e6e6" }}>
            <div className="p-2">
                <DateComponent maxDate={maxDate} minDate={minDate2()} monthOnChange={monthChange2} month={monthNext} formatValue={formatValue} selectedStart={selectedStart} setSelectedStart={setSelectedStart} selectedEnd={selectedEnd} setSelectedEnd={value => (setSelectedEnd(value), canSelectEnd && value && selectedStart && hide())} canSelectEnd={canSelectEnd} setCanSelectedEnd={setCanSelectedEnd} hover={hover} setHover={setHover} />
            </div>
        </Grid> */}
    </Grid>
}

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Typography from "@mui/material/Typography";
import { Slide } from "@mui/material";
import { isArray } from "../lib";
import { BgsLabel } from "./input";

interface DateComponentProps {
    selectedStart: moment.Moment | null | undefined;
    selectedEnd: moment.Moment | null | undefined;
    hover: moment.Moment | null | undefined;
    setSelectedStart: (value: moment.Moment | null | undefined) => void;
    setSelectedEnd: (value: moment.Moment | null | undefined) => void;
    setHover: (value: moment.Moment | null | undefined) => void;
    setCanSelectedEnd: (value: boolean) => void;
    canSelectEnd: boolean;
    formatValue: string;
    monthAdd?: number;
    month?: moment.Moment | null;
    minDate?: moment.Moment | null;
    maxDate?: moment.Moment | null;
    selector?: boolean;
    monthOnChange?: (value: moment.Moment) => void;
    disabledDates?: (moment.Moment | null)[];
    isMultiple?: boolean;
    valueFormat: string;
    mode: "date" | "datetime" | "time" | "daterange" | "month"
}

const DateComponent = ({ mode: modeInput, isMultiple = true, disabledDates = [], monthOnChange = () => { }, minDate, maxDate, selector = true, month: monthDefault = moment(), monthAdd = 0, selectedStart, selectedEnd, formatValue, hover, setHover, setSelectedStart, setSelectedEnd, canSelectEnd, setCanSelectedEnd }: DateComponentProps) => {
    const [total, setTotal] = useState<number>(0)
    const [startDay, setStartDay] = useState<string>("")
    const days: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [mode, setMode] = useState<"date" | "month" | "year">(modeInput === "month" ? "month" : "date")
    const [isAdd, setIsAdd] = useState<boolean>(false)
    const [isShow, setIsShow] = useState<boolean>(true)

    const [month, setMonth] = useState<string>(
        monthAdd > 0
            ? (monthDefault
                ? moment(monthDefault).add(monthAdd, "months").format(formatValue)
                : moment().format(formatValue))
            : (monthAdd === 0 ?
                (monthDefault ? moment(monthDefault).format(formatValue) : moment().format(formatValue))
                : (monthDefault
                    ? moment(monthDefault).subtract(Math.abs(monthAdd), "months").format(formatValue)
                    : moment().format(formatValue)))
    )

    useEffect(() => {
        if (mode === "year") {
            setTimeout(() => {
                const selectedYear: any = document.querySelectorAll('.year-selected');
                if (selectedYear.length) selectedYear[0]?.focus();
            })
        }
    }, [mode])

    useEffect(() => {
        const start: string = moment(month, formatValue).startOf('month').format("ddd");
        const end: number = Number(moment(month, formatValue).endOf('month').format("DD"));
        setStartDay(start)
        setTotal(end)
    }, [month])

    useEffect(() => {
        setMonth(
            monthAdd > 0
                ? (monthDefault
                    ? moment(monthDefault).add(monthAdd, "months").format(formatValue)
                    : moment().format(formatValue))
                : (monthAdd === 0 ?
                    (monthDefault ? moment(monthDefault).format(formatValue) : moment().format(formatValue))
                    : (monthDefault
                        ? moment(monthDefault).subtract(Math.abs(monthAdd), "months").format(formatValue)
                        : moment().format(formatValue)))
        )
    }, [monthDefault])

    const selectDate = (value: moment.Moment) => {
        if (isMultiple) {
            if (!selectedStart) setSelectedStart(value), setCanSelectedEnd(true)
            else {
                if (selectedStart && !selectedEnd && value <= selectedStart) setSelectedStart(value), setSelectedEnd(null), setCanSelectedEnd(true)
                else if (selectedStart && selectedEnd) {
                    if (value >= selectedEnd) setSelectedEnd(null)

                    if (!canSelectEnd) setSelectedStart(value), setCanSelectedEnd(true)
                    else {
                        if (value <= selectedStart) setSelectedStart(value), setCanSelectedEnd(true), setSelectedEnd(null)
                        else setSelectedEnd(value), setCanSelectedEnd(false)
                    }
                }
                else setSelectedEnd(value), setCanSelectedEnd(false)
            }
        }
        else setSelectedStart(value)
    }

    const getDay = (value: moment.Moment) => {
        return value.format("ddd").toLowerCase()
    }

    const getFirstandLastMonth = (value: moment.Moment) => {
        const date = Number(value.format("DD"));
        return date === 1 ? " start-month" : (date === total ? " end-month" : "")
    }

    const hoverDay = (value: moment.Moment) => {
        if (hover && !selectedEnd) {
            if (hover >= value && (selectedStart ? selectedStart <= value : false)) return " hover-date"
        }
        else {
            if (selectedEnd && selectedStart) {
                if (selectedStart <= value && selectedEnd >= value) return " range-date"
                else {
                    if (hover && canSelectEnd && hover >= value && (selectedStart ? selectedStart <= value : false)) return " hover-date"
                    if (hover && !canSelectEnd && hover <= value && (selectedEnd ? selectedEnd > value : false)) return " hover-date-start"
                }
            }
        }

        return "";
    }

    const selectStartDay = (value: moment.Moment) => {
        return selectedStart ? (selectedStart.format("YYYY-MM-DD") === value.format("YYYY-MM-DD") ? " selected" : "") : ""
    }

    const selectEndDay = (value: moment.Moment) => {
        return selectedEnd ? (selectedEnd.format("YYYY-MM-DD") === value.format("YYYY-MM-DD") ? " selected-end" : "") : ""
    }

    const selectHoverDay = (value: moment.Moment) => {
        return hover ? (hover.format("YYYY-MM-DD") === value.format("YYYY-MM-DD") ? " hover-end" : "") : ""
    }

    const modMonth = (isAdd: boolean = false) => {
        const monthMod = moment(month, formatValue);
        const monthNow = isAdd ? monthMod.add(1, "months") : monthMod.subtract(1, "months");
        setMonth(monthNow.format(formatValue))
        monthOnChange(monthNow)
        setIsShow(false)
        setIsAdd(isAdd)
        setTimeout(() => {
            setIsAdd(!isAdd)
            setTimeout(() => setIsShow(true), 150)
        }, 100)
    }

    const disabledMinRange = () => {
        if (!minDate) return false;

        const start = moment(month, formatValue).startOf("month").format("YYYYMMDD")
        const end = moment(minDate).format("YYYYMMDD")
        return Number(start) <= Number(end)
    }

    const disabledMaxRange = () => {
        if (!maxDate) return false;
        const start = moment(month, formatValue).endOf("month").format("YYYYMMDD")
        const end = moment(maxDate).format("YYYYMMDD")
        return Number(start) >= Number(end)
    }

    const disabledMonthRange = (m: moment.Moment) => {
        let result = false;
        if (maxDate) {
            const start = moment(m).format("YYYYMM")
            const end = moment(maxDate).format("YYYYMM")
            result = Number(start) > Number(end)
        }

        if (minDate) {
            //.subtract(1, "months")
            const start = moment(m).format("YYYYMM")
            const end = moment(minDate).format("YYYYMM")
            result = result || Number(start) < Number(end)
        }

        return result
    }

    const disabledYearRange = (m: moment.Moment) => {
        let result = false;
        if (maxDate) {
            const start = moment(m).format("YYYY")
            const end = moment(maxDate).format("YYYY")
            result = Number(start) > Number(end)
        }

        if (minDate) {
            const start = moment(m).format("YYYY")
            const end = moment(minDate).format("YYYY")
            result = result || Number(start) < Number(end)
        }

        return result
    }

    const startYear = 1900;

    const disabledDate = (m: moment.Moment) => {
        let result = false;
        if (maxDate) {
            const start = moment(m).format("YYYYMMDD")
            const end = moment(maxDate).format("YYYYMMDD")
            result = Number(start) > Number(end)
        }

        if (minDate) {
            const start = moment(m).format("YYYYMMDD")
            const end = moment(minDate).format("YYYYMMDD")
            result = result || Number(start) < Number(end)
        }

        if (disabledDates.length) {
            const find = disabledDates.find(x => x && x.format("YYYYMMDD") === m.format("YYYYMMDD"))
            result = result || Boolean(find)
        }

        return result;
    }

    return <div className="min-hg-370 select-none max-wt-305 min-wt-305">
        {selector && <div className="d-flex align-items-center justify-content-between mb-2 hg-38 select-none">
            <div className="d-flex align-items-center ms-2">
                <Typography sx={{ cursor: "pointer", userSelect: "none" }} onClick={() => setMode(mode === "date" ? "month" : "date")}>
                    {moment(month, formatValue).format("MMMM YYYY")}
                    {modeInput !== "month" && <BgsButton variant="icon" className="ms-2 hg-30 wt-30">
                        {mode === "date" ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                    </BgsButton>}
                </Typography>
            </div>
            <div className="select-none">
                {mode === "date" && <>
                    <BgsButton className="next-bgs-calendar" variant="icon" disabled={disabledMinRange()} onClick={() => modMonth()}>
                        <ChevronLeftIcon />
                    </BgsButton>
                    <BgsButton className="next-bgs-calendar" variant="icon" disabled={disabledMaxRange()} onClick={() => modMonth(true)}>
                        <ChevronRightIcon />
                    </BgsButton>
                </>}
            </div>
        </div>}
        <Grid container className="calender-bgs">
            <Slide direction="up" in={mode === "year"} mountOnEnter unmountOnExit>
                <Grid item xs={12}>
                    <Grid container columns={4} spacing={0} className="calender-year-bgs max-hg-300 scroll" style={{ overflowY: "auto" }}>
                        {Children.toArray(Array(200).fill(null).map((val, index) => startYear + index).filter(year => !disabledYearRange(moment(year, "YYYY"))).map(year => <Grid item xs={1}>
                            <BgsButton
                                variant="outlined"
                                onClick={() => {
                                    setMonth(moment(`${year}-${moment(month, formatValue).format("MM")}`, "YYYY-MM").format(formatValue))
                                    setMode("month")
                                }}
                                disabled={disabledYearRange(moment(`${year}`, "YYYY"))}
                                className={`
                                ${moment().format("YYYY") === moment(`${year}`, "YYYY").format("YYYY") ? " year-now" : ""}
                                ${moment(`${year}-${moment(month, formatValue).format("MM")}`, "YYYY").format("YYYY") === moment(month, formatValue).format("YYYY") ? " year-selected" : ""}
                            `}
                            >
                                {year}
                            </BgsButton>
                        </Grid>))}
                    </Grid>
                </Grid>
            </Slide>
            <Slide direction="up" in={mode === "month"} mountOnEnter unmountOnExit>
                <Grid item xs={12}>
                    <BgsButton variant="outlined" className="w-100 select-year-mode" onClick={() => setMode("year")}>{moment(month, formatValue).format("YYYY")} <ArrowDropDownIcon /></BgsButton>
                    <Grid container columns={4} spacing={0} className="calender-month-bgs">
                        {Children.toArray(months.map((val, index) => <Grid item xs={1}>
                            <BgsButton
                                variant="outlined"
                                onClick={() => {
                                    if (modeInput !== "month") {
                                        setMonth(moment(`${moment(month, formatValue).format("YYYY")}-${index + 1 < 10 ? `0${index + 1}` : index + 1}`, "YYYY-MM").format(formatValue))
                                        setMode("date")
                                    }
                                    else {
                                        const monthSelected = moment(`${moment(month, formatValue).format("YYYY")}-${index + 1 < 10 ? `0${index + 1}` : index + 1}`, "YYYY-MM").format(formatValue)
                                        const day = moment(`${monthSelected}`, `${formatValue}`);
                                        selectDate(day)
                                    }
                                }}
                                disabled={disabledMonthRange(moment(`${moment(month, formatValue).format("YYYY")}-${index + 1 < 10 ? `0${index + 1}` : index + 1}`, "YYYY-MM"))}
                                className={`
                                ${moment().format("YYYYMM") === moment(`${moment(month, formatValue).format("YYYY")}-${index + 1 < 10 ? `0${index + 1}` : index + 1}`, "YYYY-MM").format("YYYYMM") ? " month-now" : ""}
                                ${moment(`${moment(month, formatValue).format("YYYY")}-${index + 1 < 10 ? `0${index + 1}` : index + 1}`, "YYYY-MM").format("YYYYMM") === moment(month, formatValue).format("YYYYMM") ? " month-selected" : ""}
                            `}
                            >
                                {val}
                            </BgsButton>
                        </Grid>))}
                    </Grid>
                </Grid>
            </Slide>
            <Slide direction={isAdd ? "right" : "left"} in={mode === "date" && isShow} {...(mode === "date" && isShow ? { timeout: 200 } : {})} mountOnEnter unmountOnExit>
                <div>
                    <Grid item xs={12} className="calender-days-bgs">
                        <Grid container columns={7}>
                            {days.map((day, index) => <Grid key={index} item xs={1}>
                                {day.slice(0, 1)}
                            </Grid>)}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} className="calender-date-bgs">
                        <Grid container columns={7} spacing={0} onMouseLeave={() => selectedStart && setHover(null)}>
                            {days.findIndex(x => x === startDay) === 0 ? null : <Grid className="b-0 bg-date-null" item xs={days.findIndex(x => x === startDay)}>
                            </Grid>}
                            {Array(total).fill(null).map((x, index) => {
                                const day = moment(`${month}-${index + 1}`, `${formatValue}-DD`);

                                return <Grid key={index} item xs={1} className={`
                                    ${getDay(day)}
                                    ${isMultiple && getFirstandLastMonth(day)}
                                    ${isMultiple && selectHoverDay(day)}
                                    ${isMultiple && hoverDay(day)}
                                    ${disabledDate(day) && isMultiple ? "" : `
                                        ${selectStartDay(day) === " selected" && getDay(day) === "sat" || selectStartDay(day) === " selected" && Number(day.format("DD")) === total ? " full-rounded-date" : ""}    
                                        ${selectEndDay(day) === " selected-end" && getDay(day) === "sun" ? " full-rounded-date" : ""}    
                                        ${selectHoverDay(day) === " hover-end" && (getDay(day) === "sun" || getDay(day) === "sat") ? " full-rounded-date-hover" : ""}
                                        ${hoverDay(day) === " hover-date" && Number(day.format("DD")) === 1 ? " full-rounded-date" : ""}    
                                        ${hoverDay(day) === " range-date" && getDay(day) === "sat" && Number(day.format("DD")) === 1 ? " full-rounded-date" : ""}
                                    `}
                                    ${selectStartDay(day)}
                                    ${selectEndDay(day)}
                                `}>
                                    <div onMouseEnter={() => selectedStart && setHover(day)}>
                                        <BgsButton variant="icon"
                                            onClick={() => selectDate(day)}
                                            disabled={disabledDate(day)}
                                            className={`btn-date 
                                        ${moment().format("YYYY-MM-DD") === day.format("YYYY-MM-DD") ? " date-now" : ""}
                                        ${selectedStart ? (selectedStart.format("YYYY-MM-DD") === day.format("YYYY-MM-DD") ? " selected" : "") : ""}
                                        ${selectedEnd ? (selectedEnd.format("YYYY-MM-DD") === day.format("YYYY-MM-DD") ? " selected-end" : "") : ""}
                                    `}
                                        >
                                            {index + 1}
                                        </BgsButton>
                                    </div>
                                </Grid>
                            })}
                        </Grid>
                    </Grid>
                </div>
            </Slide>
        </Grid>
    </div>
}