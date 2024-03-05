import TextField from "@mui/material/TextField";
import { EditorOptions, Label, PropsForm, TypeInput, ValidationRulesModel } from "../models/form.model";
import { Controller, UseFormReturn } from "react-hook-form";
import { v4 } from "uuid";
import { recursiveReMapping, validationRules } from "../lib";
import React, { useImperativeHandle, ChangeEvent, forwardRef, useEffect, useState } from "react";
import { IMaskInput } from 'react-imask';
import InputAdornment from "@mui/material/InputAdornment";
import { BgsButton } from "..";
import ClearIcon from '@mui/icons-material/Clear';

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
    function NumberFormatCustom() {
        return (
            <></>
        )
    },
);

interface BgsLabelIconProps {
    showIcon: boolean;
    label: Label | undefined;
    editorType: TypeInput;
    editorOptions?: EditorOptions;
}

export const BgsLabelIcon = ({ showIcon }: BgsLabelIconProps) => {

    if (showIcon) {
        return <></>
    }

    return <></>
}

interface BgsLabelProps {
    showIcon: boolean;
    label: Label | undefined;
    editorType: TypeInput;
    validation?: ValidationRulesModel[];
    editorOptions?: EditorOptions;
    formControl: UseFormReturn;
    dataField?: string;
}

export const BgsLabel = ({
    label, showIcon, editorType, validation = [], editorOptions, formControl, dataField
}: BgsLabelProps) => {

    let { text = "" } = editorOptions || {};

    let { suffix, prefix } = label || {};

    const { watch } = formControl;

    if (typeof suffix === "function") suffix = suffix();

    if (typeof prefix === "function") prefix = prefix();

    if (dataField) useEffect(() => {
        if (typeof suffix === "function") suffix = suffix();

        if (typeof prefix === "function") prefix = prefix();
    }, [watch(dataField)])

    if (typeof text === "function") text = text();

    return <span className={`bgs-label d-flex align-items-center bgs-editor-${editorType} ${label?.className || ""}`}>
        <>
            {prefix}
            <BgsLabelIcon editorType={editorType} label={label} showIcon={showIcon} editorOptions={editorOptions} />
            {text || label?.text}
            {editorType !== "checkbox" && (((label?.showColon === undefined || label?.showColon) && validation.includes("required")) && <sup className="text-danger">*</sup>)}
            {suffix}
        </>
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
    let { disabledCopyPaste, autoComplete, allowClear = false, placeholder, textAlignment: textAlign = "left", rows = editorType === "textarea" ? 2 : undefined, maxRows, minRows, multiline: multiple = false, type, suffix, prefix, disabled, readOnly, format, visible = visibleItem, onChange: onChangeItem = () => { }, onClick: onClickItem = () => { }, minNumber, maxNumber, maxLength, showPrefixWhenFocus = false, showSuffixWhenFocus = false } = editorOptions || {};
    const { mode, ...otherFormat } = format || {}

    const multiline = editorType === "textarea" || multiple;

    if (typeof suffix === "function") suffix = suffix();

    if (typeof prefix === "function") prefix = prefix();
    const [showSuffix, setShowSuffix] = useState<boolean>(!showSuffixWhenFocus)
    const [showPrefix, setShowPrefix] = useState<boolean>(!showPrefixWhenFocus)

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
                    label: <BgsLabel label={label} showIcon={showIcon} validation={validation} editorType={editorType} editorOptions={editorOptions} formControl={formControl} dataField={dataField} />
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
                onFocus={() => {
                    if (showPrefixWhenFocus) setShowPrefix(true)

                    if (showSuffixWhenFocus) setShowSuffix(true)
                }}
                onBlur={() => {
                    if (showPrefixWhenFocus) setShowPrefix(false)

                    if (showSuffixWhenFocus) setShowSuffix(false)

                    onBlur()
                }}
                error={invalid}
                disabled={disabled}
                InputLabelProps={showLabelShrink ? {
                    shrink: true,
                } : {}}
                InputProps={{
                    ...disabledCopyPaste && {
                        onCopy: (e) => e.preventDefault(),
                        onPaste: (e) => e.preventDefault(),
                    },
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
                    ...prefix && (value || showPrefix) ? { startAdornment: <InputAdornment position="start">{prefix}</InputAdornment> } : null,//<InputAdornment position="start">kg</InputAdornment>
                    ...suffix && (value || showSuffix) ? {
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