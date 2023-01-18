import FormControlLabel from "@mui/material/FormControlLabel";
import { Controller } from "react-hook-form";
import { PropsForm } from "../models/form.model";
import { recursiveReMapping, validationRules } from "../lib";
import { v4 } from "uuid";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Switch from "@mui/material/Switch";
import FormLabel from "@mui/material/FormLabel";
import React, { useImperativeHandle, forwardRef } from "react";
import { BgsLabel } from "./input";

const BgsSwitch = forwardRef(({
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

    const { label, editorOptions, dataField = v4(), validationRules: validation = [], visible: visibleItem, dataType, editorType } = item;
    const labelVisible = typeof label?.visible === "undefined" ? true : label?.visible;
    const { control } = formControl;
    let { text = "", disabled, readOnly, visible = visibleItem, onChange: onChangeOptions = () => { } } = editorOptions || {};

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
                {labelVisible ? <FormLabel component="legend"><BgsLabel label={label} showIcon={showIcon} validation={validation} editorType={editorType} /></FormLabel> : null}
                <FormControlLabel control={
                    <Switch
                        value={dataType === "number" ? (value ? true : false) : value}
                        checked={dataType === "number" ? (value ? true : false) : value}
                        onChange={(e) => {
                            onChange(e)
                            setTimeout(() => {
                                onChangeOptions({
                                    value: formRef.getData(dataField),
                                    data: null,
                                    formRef
                                })
                            })
                        }}
                        onBlur={onBlur}
                        inputRef={ref}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                }
                    label={(text ? text : label?.text) as any || ""}
                />
                <FormHelperText>{error?.message || label?.hint}</FormHelperText>
            </FormControl>
        )}
    />
})

export default BgsSwitch;