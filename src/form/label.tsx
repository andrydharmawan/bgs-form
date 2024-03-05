import { Controller } from "react-hook-form";
import { PropsForm } from "../models/form.model";
import { formatCurrency, recursiveReMapping } from "../lib";
import { v4 } from "uuid";
import FormControl from "@mui/material/FormControl";
import React, { useImperativeHandle, forwardRef } from "react";
import moment from "moment";
import Typography from "@mui/material/Typography";

const BgsLabel = forwardRef(({
    name,
    item,
    formControl,
    formRef,
    apperance,
    loading,
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

    const { label, editorOptions, dataField = v4(), visible: visibleItem, dataType = "string" } = item;
    const { control } = formControl;
    let { suffix, prefix, visible = visibleItem, className, aligned = "vertical", format, renderTemplate } = editorOptions || {};

    if (typeof suffix === "function") suffix = suffix();

    if (typeof prefix === "function") prefix = prefix();

    const formatText = (value: any) => {
        if (dataType === "number" && !value) value = 0;

        if (value === undefined || value === null) return "";

        switch (dataType) {
            case "boolean":
                value = value ? "true" : "false"
                break;
            case "date":
                value = moment(value).format(format?.display || "DD MMM YYYY")
                break;
            case "datetime":
                value = moment(value).format(format?.display || "DD MMM YYYY HH:mm")
                break;
            case "time":
                const { value: valueFormat = "HH:mm" } = format || {};
                value = moment(value, valueFormat).format(format?.display || "HH:mm")
                break;
            case "number":
                value = formatCurrency(value)
                break;
        }

        if (renderTemplate && typeof renderTemplate === "function") return renderTemplate(value, formRef.getData(), formRef)
        else return value || "-";
    }

    return <Controller
        name={dataField}
        control={control}
        render={({
            field: { value = "" },
        }) => (
            <FormControl className="w-100">
                {visible ? <div className={`w-100`}>
                    {aligned === "vertical" ? <>
                        <Typography className={`text-secondary ${!label?.className?.includes("fs-") ? " fs-13 " : ""} ${label?.className}`}>{label?.text || ""}</Typography>
                        <Typography className={`${className} min-hg-23 w-100 ${!className?.includes("fs-") ? " fs-13 " : ""} ${className}`}>{prefix}{formatText(value)}{suffix}</Typography>
                    </> : <>
                        <div className="row">
                            <div className="col-md-5">
                                <Typography className={`text-secondary ${!label?.className?.includes("fs-") ? " fs-13 " : ""} ${label?.className}`}>{label?.text || ""}</Typography>
                            </div>
                            <div className="col-md-7">
                                <Typography className={`min-hg-23 w-100 ${!className?.includes("fs-") ? " fs-13 " : ""} ${className}`}>: {prefix}{formatText(value)}{suffix}</Typography>
                            </div>
                        </div>
                    </>}
                </div> : null}
            </FormControl>
        )}
    />
})

export default BgsLabel;