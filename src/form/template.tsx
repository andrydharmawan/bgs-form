import { PropsForm } from "../models/form.model";
import { Controller } from "react-hook-form";
import { recursiveReMapping, validationRules } from "../lib";
import React, { useImperativeHandle, forwardRef } from "react";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";

const BgsTemplate = forwardRef(({
    name,
    item,
    formControl,
    formRef,
    apperance,
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

    const { label, editorOptions, dataField, validationRules: validation = [], visible: visibleItem } = item;
    const labelVisible = typeof label?.visible === "undefined" ? true : label?.visible;
    const { control, setValue } = formControl;
    let { disabled, readOnly, visible = visibleItem } = editorOptions || {};

    return dataField ? <Controller
        name={dataField}
        control={control}
        rules={!visible || disabled || readOnly ? {} : validationRules(validation, item, formControl, formRef)}
        render={({
            field: { onChange, onBlur, ref, value = "" },
            fieldState: { invalid, error },
        }) => (
            <>
                <FormControl error={invalid} className="w-100">
                    {item?.template && item?.template({
                        item,
                        formControl,
                        formRef,
                        value,
                        data: formRef.getData(),
                        onChange, 
                        onBlur, 
                        ref, 
                        setValue: v => setValue(dataField, v), label: <span className={`${label?.className}`}>{(label?.showColon === undefined || label?.showColon) && validation.includes("required") ? <sup className="text-danger">*</sup> : null}{label?.text}</span>,
                        invalid,
                        disabled: !!disabled
                    })}
                    <FormHelperText>{error?.message || label?.hint}</FormHelperText>
                </FormControl>
            </>
        )}
    /> : <>
        {item?.template && item?.template({
            item,
            formControl,
            formRef,
            value: null,
            data: formRef.getData()
        } as any)}
    </>
})
export default BgsTemplate;