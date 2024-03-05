import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Controller } from "react-hook-form";
import { PropsForm } from "../models/form.model";
import { recursiveReMapping, validationRules } from "../lib";
import { v4 } from "uuid";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import React, { useImperativeHandle, forwardRef } from "react";
import { BgsLabel } from "./input";
const BgsCheckbox = forwardRef(({
    name,
    item,
    formControl,
    formRef,
    apperance,
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
    let { text = "", disabled, readOnly, visible = visibleItem, onChange: onChangeOptions = () => { }, className } = editorOptions || {};

    if (typeof text === "function") text = text();

    return <Controller
        name={dataField}
        control={control}
        rules={!visible || disabled || readOnly ? {} : validationRules(validation, item, formControl, formRef)}
        render={({
            field: { onChange, onBlur, ref, value = false },
            fieldState: { invalid, error },
        }) => (
            <FormControl error={invalid}>
                <FormControlLabel control={
                    <Checkbox
                        value={value}
                        checked={value}
                        className={className}
                        onChange={(e) => {
                            onChange(e)
                            onChangeOptions({
                                value: e.target.checked,
                                data: null,
                                formRef
                            })
                        }}
                        onBlur={onBlur}
                        inputRef={ref}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                }
                    {...labelVisible ? {
                        label: <BgsLabel label={label} showIcon={showIcon} validation={validation} editorType={editorType} editorOptions={editorOptions} formControl={formControl} dataField={dataField} />
                    } : { label: "" }}
                />
                <FormHelperText>{error?.message || label?.hint}</FormHelperText>
            </FormControl>
        )}
    />
})

export default BgsCheckbox;

