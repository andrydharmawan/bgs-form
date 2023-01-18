import { ForwardedRef, forwardRef, PropsWithChildren, useImperativeHandle, useRef, useState } from "react";
import { getFieldValue, isArray, jsonCopy, overrideValue, validationRules } from "../lib";
import { FormGroupModel, FormRef, Items } from "../models/form.model";
import { useForm } from "react-hook-form";
import moment from "moment";
import BgsSpinner from "./spinner";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Typography } from "@mui/material";
import React from "react";
const BgsGroupForm = forwardRef(({
    formData = {},
    disabled: disabledForm = false,
    readOnly: readOnlyForm = false,
    onSubmit = () => { },
    className,
    render = () => { },
    apperance = "outlined",
    loadPanel = true,
    item,
    spacing = 1,
    showLabelShrink = false,
    showIcon = false
}: PropsWithChildren<FormGroupModel>, ref: ForwardedRef<FormRef>) => {
    useImperativeHandle(ref, () => formRef);
    const formElement = useRef<HTMLFormElement>(null);
    let refGroup: { [x: string]: FormRef; } = {};
    let refGroupName: string[] = [];
    let refGroupDataField: { [x: string]: string[] } = {};
    const [loadingState, setLoadingState] = useState<boolean>(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const formControl = useForm({
        reValidateMode: "onSubmit",
        mode: "all",
        defaultValues: formData
    });

    const disabled = (value: boolean = true) => {
        refGroupName.forEach(key => {
            refGroup[key].disabled(value)
        })
    }

    const readOnly = (value: boolean = true) => {
        refGroupName.forEach(key => {
            refGroup[key].readOnly(value)
        })
    }

    const formRef: FormRef = {
        triggerSubmit: () => submitForm(),
        updateData: (key, data) => updateData(key, data),
        loading: (value) => loading(value),
        itemOption: (field) => {
            try {
                const name: any = findDataFieldOnGroup(field);
                const { type, item: itemData }: any = refGroup[name] || {};

                if (type) {
                    let result: any = itemData;
                    return {
                        option: (key, value) => {
                            if (key) {
                                if (value !== undefined) {
                                    try {
                                        overrideValue(result, key, value);
                                        const valuesDefault = jsonCopy(getValues());
                                        item[name] = result;
                                        clearErrors(field);
                                        if (key.includes("validationRules") || key.includes("disabled") || key.includes("visible") || key.includes("readOnly")) unregister(field), setError(field, {
                                            type: "validate",
                                            types: validationRules(result.validationRules, result, formControl, formRef)
                                        }, { shouldFocus: true }), clearErrors(field), updateData(field, valuesDefault[field]);
                                    } catch (error) {
                                        error ? true : false
                                        // console.log(error, "error options")
                                    }
                                }
                                else return getFieldValue(result, key);
                            }
                            else return result;
                        }
                    }
                }
                else return refGroup[name].itemOption(field)
            } catch (error) {
                return {
                    option: () => { }
                }
            }
        },
        reset: (key) => reset(key),
        getData: (key) => getData(key),
        formControl,
        disabled: (value) => disabled(value),
        readOnly: (value) => readOnly(value),
        btnSubmit: (value, type) => btnSubmit(value, type),
        setError: (message) => setErrorMessage(message),
        to: value => {}
    }

    const { trigger, setValue, getValues, reset: resetdata, resetField, clearErrors, setError, unregister } = formControl;

    const setErrorMessage = (message: string | null) => {
        setErrorState(message);
        disabled(message ? true : false)
    }

    const updateData = (key: any = {}, data?: any) => {
        if (typeof key === "string") setValue(key, data)
        else if (typeof key === "object") Object.keys(key).forEach(item => setValue(item, key[item]))
    }

    const loading = (value: boolean) => {
        setLoadingState(value)
    }

    const getData = (key?: string) => {
        const values = getDataMapping(getValues())
        return key ? values[key] : values;
    }

    const getDataMapping = (values: any) => {
        Object.keys(values).forEach(field => {
            const name: any = findDataFieldOnGroup(field);
            const { editorOptions = {}, editorType, dataType }: Items = refGroup[name]?.itemOption(field).option() || {};

            switch (editorType) {
                case "date":
                    const { mode, format } = editorOptions;
                    const { value: valueFormat } = format || {};
                    if (mode === "daterange" && isArray(values[field], 1)) {
                        values[field] = [values[field][0] ? moment(values[field][0]).format(valueFormat) : null, values[field][1] ? moment(values[field][1]).format(valueFormat) : null]
                    }
                    else if(mode === "time") {
                        values[field] = moment(values[field], "HH:mm:ss").format(valueFormat)
                    }
                    else {
                        if (values[field]) values[field] = moment(values[field]).format(valueFormat)
                    }
                    break;
                case "switch":
                    if ((dataType === "boolean" || !dataType) && values[field] !== undefined) values[field] = !!values[field];
                    else if (dataType === "number") values[field] = values[field] ? 1 : 0;
                    break;
                case "number":
                    values[field] = values[field] !== undefined ? Number(values[field]) : null;
                    break;
                default:
            }

            switch (dataType) {
                case "number":
                    values[field] = values[field] !== undefined ? Number(values[field]) : null;
                    break;
                case "string":
                    values[field] = values[field] !== undefined ? String(values[field]) : null;
                    break;
                case "boolean":
                    values[field] = values[field] !== undefined ? !!values[field] : null;
                    break;
            }

            if (values[field] === undefined) values[field] = null
        })

        return values;
    }

    const findDataFieldOnGroup = (field: string) => {
        let result = null;
        Object.keys(refGroupDataField).forEach(key => {
            if (refGroupDataField[key].includes(field)) result = key;
        })
        return result;
    }

    const reset = (key?: string | string[]) => {
        if (key) {
            if (typeof key === "string") resetField(key)
            else if (typeof key === "object" && isArray(key, 0)) key.forEach(fd => resetField(fd))
        }
        else resetdata()
    }

    const btnSubmit = (value: boolean | string, type: "visible" | "disabled" | "text" | "loading" = "visible") => {
    }

    const findDataField = (itms: Items[]): any => {
        let fieldsOnGroup: string[] = [];
        itms.forEach(im => {
            if (im) {
                if (im.itemType === "group") {
                    if (im.name) fieldsOnGroup.push(im.name)
                    fieldsOnGroup = [...fieldsOnGroup, ...findDataField(im.items as Items[])]
                }
                else {
                    if (typeof im === "string") {
                        const fld = (im as any)?.split("|");
                        fieldsOnGroup.push(fld.length ? fld[0] : im)
                    }
                    else {
                        if (im.dataField) fieldsOnGroup.push(im.dataField)
                    }
                }
            }
        })
        return fieldsOnGroup
    }

    const refChild = (e: FormRef) => {
        if (!e) return
        if (!e.name) e.name = "";

        refGroup = {
            ...refGroup,
            [e.name]: e
        }

        if (!refGroupName.includes(e.name)) refGroupName = [...refGroupName, e.name]

        let itemData: any = {};

        if (e.name && item) {
            if (typeof item[e.name] !== "string") {
                const im: any = item[e.name] || {}
                itemData = {
                    [e.name || ""]: im.dataField && !im.items ? [im.dataField] : findDataField(im.items)
                };
            }
        }
        refGroupDataField = {
            ...refGroupDataField,
            ...itemData
        }
        // console.log(refGroupDataField, "refGroupDataField")
    }

    const submitForm = async () => {
        const isValid = await trigger();
        let values: any = getDataMapping(getValues());
        if (process.env.BUILD_ID === "development") console.log(values, "values");
        if (isValid) {
            onSubmit(values, formRef)
        }
    }

    return <form ref={formElement} className={`position-relative ${className} ${loadingState && loadPanel ? "loading-form" : ""} ${errorState ? "error-form" : ""}`}
        onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            submitForm()
        }}
    >
        {render ? render({ disabled: disabledForm, formGroup: formControl, readOnly: readOnlyForm, formData, item, ref: refChild, formControl, formRef, apperance, loading: loadingState, spacing, showLabelShrink, showIcon }) : null}
        {loadingState && loadPanel ? <div className="border shaddow loading-container">
            <BgsSpinner size={35} className="loading-content mb-2" />
            Loading...
        </div> : null}
        {errorState ? <div className="border shaddow error-container">
            <ErrorOutlineIcon className="text-danger me-2" sx={{ fontSize: 40 }} />
            <div>
                <Typography className="fw-bold mb-1">Error</Typography>
                <Typography>{errorState}</Typography>
            </div>
        </div> : null}
    </form>
})

export default BgsGroupForm;