import TextField from "@mui/material/TextField";
import { Label, PropsForm, TypeInput, ValidationRulesModel } from "../models/form.model";
import { Controller } from "react-hook-form";
import { v4 } from "uuid";
import { recursiveReMapping, validationRules } from "../lib";
import React, { useImperativeHandle, ChangeEvent, forwardRef } from "react";
import { IMaskInput } from 'react-imask';
import NumberFormat from 'react-number-format';
import InputAdornment from "@mui/material/InputAdornment";
import { BgsButton } from "..";
import ClearIcon from '@mui/icons-material/Clear';
import { IconHeader } from "../table/header";
import { HeaderIcon } from "../models/table.model";

const TextMaskCustom = forwardRef<HTMLElement, any>(
    function TextMaskCustom(props, ref) {
        const {
            onChange,
            mask,//(#00) 000-0000
            definitions = {
                "#": /[1-9]/,
            },
            ...other
        } = props;

        return (
            <IMaskInput
                {...other}
                mask={mask}
                definitions={definitions}
                inputRef={ref}
                onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
                overwrite
            />
        );
    },
);

const NumberFormatCustom = forwardRef<any, any>(
    function NumberFormatCustom(props, ref) {

        const {
            onChange,
            thousandSeparator = ".",
            decimalSeparator = ",",
            isNumericString = true,
            prefix,//sample "Rp. "
            ...other
        } = props;

        return (
            <NumberFormat
                {...other}
                getInputRef={ref}
                onValueChange={(values) => {
                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    });
                }}
                thousandSeparator={thousandSeparator}
                decimalSeparator={decimalSeparator}
                isNumericString={isNumericString}
                prefix={prefix}
            />
        );
    },
);

interface BgsLabelIconProps {
    showIcon: boolean;
    label: Label | undefined;
    editorType: TypeInput;
}

export const BgsLabelIcon = ({ showIcon, label, editorType }: BgsLabelIconProps) => {
    if (label?.icon) return <IconHeader icon={label?.icon} />

    if (showIcon) {
        let icon: HeaderIcon = "text"
        switch (editorType) {
            case "date":
                icon = "date"
                break;
            case "upload":
                icon = "image"
                break;
            case "select":
                icon = "list"
                break;
            case "autocomplete":
                icon = "list"
                break;
            case "checkbox":
                return <></>
            case "checkboxgroup":
                return <></>
            case "radiobutton":
                return <></>
            case "switch":
                return <></>
        }

        return <IconHeader icon={icon} />
    }

    return <></>
}

interface BgsLabelProps {
    showIcon: boolean;
    label: Label | undefined;
    editorType: TypeInput;
    validation?: ValidationRulesModel[];
}

export const BgsLabel = ({
    label, showIcon, editorType, validation = []
}: BgsLabelProps) => {
    return <span className={`bgs-label d-flex align-items-center bgs-editor-${editorType} ${label?.className || ""}`}>
        <BgsLabelIcon editorType={editorType} label={label} showIcon={showIcon} />
        {label?.text}
        {((label?.showColon === undefined || label?.showColon) && validation.includes("required")) && <sup className="text-danger">*</sup>}
    </span>
}

const BgsInput = forwardRef(({
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

    const { label, editorOptions, dataField = v4(), validationRules: validation = [], editorType, visible: visibleItem } = item;
    const labelVisible = typeof label?.visible === "undefined" ? true : label?.visible;
    const { control } = formControl;
    let { autoComplete, allowClear = false, placeholder, textAlignment: textAlign = "left", rows = editorType === "textarea" ? 2 : undefined, maxRows, minRows, multiline: multiple = false, type, suffix, prefix, disabled, readOnly, format, visible = visibleItem, onChange: onChangeItem = () => { }, onClick: onClickItem = () => { }, minNumber, maxNumber, maxLength } = editorOptions || {};
    const { mode, ...otherFormat } = format || {}

    const multiline = editorType === "textarea" || multiple;

    if (typeof suffix === "function") suffix = suffix();

    if (typeof prefix === "function") prefix = prefix();

    return <Controller
        name={dataField}
        control={control}
        rules={!visible || disabled || readOnly ? {} : validationRules(validation, item, formControl, formRef)}
        render={({
            field: { onChange, onBlur, ref, value = "" },
            fieldState: { invalid, error },
        }) => (
            <TextField
                key={dataField}
                value={value}
                inputRef={ref}
                {...labelVisible ? {
                    label: <BgsLabel label={label} showIcon={showIcon} validation={validation} editorType={editorType} />
                } : { label: "" }}
                fullWidth
                variant={apperance}
                size="small"
                autoComplete={autoComplete}
                className={`bgs-${editorType}`}
                type={type}
                onClick={(event) => {
                    onClickItem({
                        event,
                        loading: () => { },
                        modalRef: null as any,
                        menuRef: null as any,
                        formRef,
                        data: null as any
                    } as any, formRef)
                }}
                onChange={(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                    onChange(event)
                    onChangeItem({
                        value: event.target.value,
                        formRef,
                        data: null
                    });
                }}
                onBlur={onBlur}
                error={invalid}
                disabled={disabled}
                InputLabelProps={showLabelShrink ? {
                    shrink: true,
                } : {}}
                InputProps={{
                    autoComplete,
                    ...mode === "mask" ? { inputComponent: TextMaskCustom as any } : null,
                    ...mode === "number" ? { inputComponent: NumberFormatCustom as any } : null,
                    inputProps: {
                        ...otherFormat,
                        autoComplete,
                        placeholder,
                        maxLength,
                        ...minNumber ? { min: minNumber } : null,
                        ...maxNumber ? { max: maxNumber } : null,
                        style: {
                            textAlign
                        }
                    },
                    className: `${editorOptions?.className}`,
                    readOnly,
                    ...prefix ? { startAdornment: <InputAdornment position="start">{prefix}</InputAdornment> } : null,//<InputAdornment position="start">kg</InputAdornment>
                    ...suffix ? {
                        endAdornment: <InputAdornment position="end">
                            {allowClear && value ? <BgsButton variant="icon" onClick={() => {
                                formRef.reset(dataField)
                                onChangeItem({
                                    value: null,
                                    formRef,
                                    data: null
                                });
                            }}>
                                <ClearIcon />
                            </BgsButton> : null}
                            {suffix}
                        </InputAdornment>
                    } : (allowClear && value ? {
                        endAdornment: <InputAdornment position="end">
                            <BgsButton variant="icon" onClick={() => {
                                formRef.reset(dataField)
                                onChangeItem({
                                    value: null,
                                    formRef,
                                    data: null
                                });
                            }}>
                                <ClearIcon />
                            </BgsButton>
                        </InputAdornment>
                    } : null),//<InputAdornment position="start">kg</InputAdornment>
                }}
                rows={rows}
                maxRows={maxRows}
                minRows={minRows}
                multiline={multiline}
                helperText={error?.message || label?.hint}
            />
        )}
    />
})
export default BgsInput;