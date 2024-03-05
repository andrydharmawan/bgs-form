import React, { ForwardedRef, forwardRef, PropsWithChildren, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FormModel } from "../models/models";
import { FormRef, Items, PropsForm, ResItemOption } from "../models/form.model";
import BgsComponentForm from "./component";
import BgsLayoutForm from "./layout";
import { useForm } from "react-hook-form";
import moment from "moment";
import BgsSpinner from "./spinner";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Typography } from "@mui/material";
import { v4 } from "uuid";
import { getFieldValue, isArray, jsonCopy, overrideValue, split, validationRules } from "../lib";
import useRouter from "../lib/router";
import Grid from "@mui/material/Grid";

const BgsForm = forwardRef(({
    name,
    item: group,
    colCount = 1,
    spacing = 1,
    items = [],
    formData = {},
    disabled: disabledForm = false,
    readOnly: readOnlyForm = false,
    onSubmit = () => { },
    className,
    formGroup,
    apperance = "outlined",
    loadPanel = true,
    loading: loadingForm = false,
    setFocus = () => { },
    showLabelShrink = false,
    showIcon = false,
    actionCode,
    menuCode: menuCodeDefault,
    ...others
}: PropsWithChildren<FormModel>, ref: ForwardedRef<FormRef>) => {
    if (name && group) {
        if (typeof group[name] !== "string") {
            const im: any = group[name] || {};
            colCount = im.colCount || 1;
            spacing = im.spacing || 1;
            items = im.items.filter((x: any) => x !== undefined) || [];
            setFocus = im.setFocus || (() => { });
        }
    }

    useImperativeHandle(ref, () => formRef);
    const router = useRouter();

    const [itemsStateOld, setItemsStateOld] = useState<Items[]>([]);
    const [itemsState, setItemsState] = useState<Items[]>([]);
    const [loadingState, setLoadingState] = useState<boolean>(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const formControl = formGroup || useForm({
        reValidateMode: "onSubmit",
        mode: "all",
        defaultValues: formData
    });

    const formElement = useRef<HTMLFormElement>(null);

    const formRef: FormRef = {
        triggerSubmit: () => submitForm(),
        updateData: (key, data) => updateData(key, data),
        loading: (value) => loading(value),
        itemOption: (field) => itemOption(field),
        reset: (key) => reset(key),
        getData: (key) => getData(key),
        formControl,
        disabled: (value) => disabled(value),
        readOnly: (value) => readOnly(value),
        btnSubmit: (value, type) => btnSubmit(value, type),
        setError: (message) => setErrorMessage(message),
        to: value => router.push(value),
        name
    }

    const { trigger, setValue, getValues, reset: resetdata, resetField, clearErrors, setError, unregister } = formControl;

    useEffect(() => {
        if (isArray(items, 0) && items) setItemsState(items.filter(x => x !== undefined).map(recursiveReMapping))
    }, [])

    useEffect(() => {
        setItemsStateOld(itemsState.map(recursiveReMapping))
    }, [itemsState])

    const recursiveReMapping = (item: string | Items | null | undefined, index?: number, array?: any, parent?: Items): Items => {
        if (typeof item === "string") {
            /** 
             * format String
             * [0]: dataField
             * [1]: "[property]:[value]""
             * 
             * sample value "fieldAbc|editorType:select"
             * 
            **/
            let propertyField: Items = {
                editorType: "input"
            };

            item.split("|").forEach((prp, index) => {
                if (index === 0) {
                    propertyField.dataField = prp;
                }
                else {
                    const dtlPrp = prp.split("=");
                    try {
                        if (dtlPrp[0] === "validationRules") {
                            if (dtlPrp.length === 1) propertyField[dtlPrp[0]] = ["required"];
                            else {
                                if (dtlPrp[1].includes("[")) {
                                    propertyField[dtlPrp[0]] = JSON.parse(dtlPrp[1])
                                }
                                else {
                                    propertyField[dtlPrp[0]] = dtlPrp[1].split(",")
                                }
                            }
                        }
                        else {
                            if (dtlPrp[0].includes(".")) {
                                const property = dtlPrp[0].split(".");
                                propertyField[property[0]] = {
                                    ...propertyField[property[0]],
                                    [property[1]]: JSON.parse(dtlPrp[1])
                                }
                            }
                            else propertyField[dtlPrp[0]] = JSON.parse(dtlPrp[1])
                        }
                    } catch (error) {
                        if (dtlPrp[0].includes(".")) {
                            const property = dtlPrp[0].split(".");
                            propertyField[property[0]] = {
                                ...propertyField[property[0]],
                                [property[1]]: dtlPrp[1]
                            }
                        }
                        else propertyField[dtlPrp[0]] = dtlPrp[1]
                    }
                }
            })

            if (!propertyField?.label?.text && propertyField?.dataField) propertyField.label = { ...propertyField?.label, text: split.changeAll(propertyField?.dataField) }

            return recursiveReMapping(propertyField, index, array, parent);
        }
        else if ((item === null && typeof item === "object") || item === undefined) {
            return recursiveReMapping({
                template: () => null
            }, index, array, parent);
        }
        else {
            const { itemType, items = [], editorType, template, disabled: disabledGroupMain = false, visible: visibleGroupMain = true, readOnly: readOnlyGroupMain = false } = item;

            if (itemType === "group") return {
                ...item,
                visible: visibleGroupMain,
                disabled: disabledGroupMain,
                readOnly: readOnlyGroupMain,
                items: items.filter(x => x !== undefined).map((itemChild: any, index: number, array: any) => recursiveReMapping(itemChild, index, array, item))
            }
            else {
                let { disabled: disabledGroup = false, visible: visibleGroup = true, readOnly: readOnlyGroup = readOnlyForm || false } = parent || {};
                if (disabledForm) disabledGroup = disabledForm;

                let { label, dataField, editorOptions, validationRules = [], visible: visibleItem = typeof visibleGroup === "undefined" ? true : visibleGroup } = item;
                let { format, mode = "date", disabled = false, readOnly = readOnlyGroup || false, visible = true } = editorOptions || {};

                if (disabledGroup) disabled = disabledGroup;

                if (!label?.text && dataField) label = { ...label, text: split.changeAll(dataField) }

                visible = visibleItem;

                if (editorType === "date") {
                    const { display, value, mask = "" } = format || {};

                    let displayFormat = "";
                    let valueFormat = "";

                    switch (mode) {
                        case "datetime":
                            displayFormat = "DD MMM YYYY HH:mm:ss";
                            valueFormat = "YYYY-MM-DD HH:mm:ss";
                            break;
                        case "time":
                            displayFormat = "HH:mm";
                            valueFormat = "HH:mm";
                            break;
                        case "daterange":
                            displayFormat = "DD MMM YYYY";
                            valueFormat = "YYYY-MM-DD";
                            break;
                        case "month":
                            displayFormat = "MMM YYYY";
                            valueFormat = "YYYY-MM";
                            break;
                        default:
                            displayFormat = "DD MMM YYYY";
                            valueFormat = "YYYY-MM-DD";
                            break;
                    }

                    const { editorOptions: editorOptionsOld } = options(item.dataField || "", itemsStateOld) || {};
                    const { mode: modeOld } = editorOptionsOld || {};

                    return {
                        ...item,
                        label,
                        visible: visibleItem,
                        editorOptions: {
                            ...editorOptions,
                            disabled,
                            readOnly,
                            visible,
                            format: {
                                ...format,
                                display: modeOld ? (mode === modeOld ? (display || displayFormat) : displayFormat) : (display || displayFormat),
                                value: modeOld ? (mode === modeOld ? (value || valueFormat) : valueFormat) : (value || valueFormat),
                                mask
                            }
                        },
                        validationRules
                    };
                }
                else if (editorType === "buttongroup") {
                    const { items = [] } = item?.editorOptions || {}

                    return {
                        ...item,
                        label,
                        visible: visibleItem,
                        editorType,
                        editorOptions: {
                            ...editorOptions,
                            items: items.map(itCh => {
                                let disabled = itCh.disabled || false;

                                if (disabledGroup) disabled = disabledGroup;

                                return {
                                    ...itCh,
                                    disabled,
                                    name: itCh.type === "submit" ? "btn-submit" : itCh.name
                                }
                            }),
                            disabled,
                            readOnly,
                            visible
                        },
                        validationRules
                    }
                }
                else return {
                    ...item,
                    label,
                    visible: visibleItem,
                    editorType: editorType || (template ? "template" : "input"),
                    ...editorType === "button" && editorOptions?.type === "submit" ? { name: "btn-submit" } : null,
                    ...editorType === "select" ? {
                        refresh: () => {
                            if (item && name) {
                                let group: any = others;
                                group.formRef.itemOption(item?.dataField || "select").option("key", v4())
                            }
                            else itemOption(item?.dataField || "select").option("key", v4())
                        },
                        ...item.getDataSource ? item.getDataSource : {
                            getDataSource: () => {
                                return [];
                            }
                        },
                        ...item.getDataSelected ? item.getDataSelected : {
                            getDataSelected: () => {
                                return null;
                            }
                        },
                        ...item.setDisabledOption ? item.setDisabledOption : {
                            setDisabledOption: (key = []) => key
                        },
                    } : null,
                    editorOptions: {
                        ...editorOptions,
                        ...["number", "mask"].includes(editorType || "input") ? { format: { mode: item.editorType as any, ...editorOptions?.format } } : null,
                        disabled,
                        readOnly,
                        visible
                    },
                    validationRules
                }
            }
        }
    }

    const setErrorMessage = (message: string | null) => {
        setErrorState(message);
        disabled(message ? true : false)
    }

    const renderComponent = ({ item, formControl, indexKey, formRef, apperance, loading, spacing }: PropsForm) => {
        switch (item?.itemType) {
            case "group":
                return <BgsLayoutForm item={item} formControl={formControl} indexKey={indexKey} formRef={formRef} apperance={apperance} loading={loading} group={group} spacing={spacing} showLabelShrink={showLabelShrink} showIcon={showIcon} />
            default:
                return <BgsComponentForm item={item} formControl={formControl} formRef={formRef} apperance={apperance} loading={loading} group={group} spacing={spacing} showLabelShrink={showLabelShrink} showIcon={showIcon} />
        }
    }
    // @ts-ignore
    const colSpan = (item: any, colCount: any) => {
        const colSpan = Math.round((12 / colCount) * (item?.colSpan || 1));
        return colSpan === 1 ? `col` : `col-${colSpan}`
    }

    const updateData = (key: any = {}, data?: any) => {
        if (typeof key === "string") setValue(key, data)
        else if (typeof key === "object") Object.keys(key).forEach(item => setValue(item, key[item]))
    }

    const loading = (value: boolean) => {
        setLoadingState(value)
        // btnSubmit(value, "loading")
    }

    const getData = (key?: string) => {
        const values = getDataMapping(getValues())
        return key ? values[key] : values;
    }

    const getDataMapping = (values: any) => {
        Object.keys(values).forEach(field => {
            const { editorOptions = {}, editorType, dataType }: Items = itemOption(field).option() || {};
            switch (editorType) {
                case "date":
                    const { mode, format } = editorOptions;
                    const { value: valueFormat } = format || {};
                    if (mode === "daterange" && isArray(values[field], 1)) {
                        values[field] = [values[field][0] ? moment(values[field][0]).format(valueFormat) : null, values[field][1] ? moment(values[field][1]).format(valueFormat?.replace(/d/g, "D")).replace(/y/g, "Y") : null]
                    }
                    else if (mode === "time") {
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

    const reset = (key?: string | string[]) => {
        if (key) {
            if (typeof key === "string") resetField(key)
            else if (typeof key === "object" && isArray(key, 0)) key.forEach(fd => resetField(fd))
        }
        else resetdata()
    }

    const options = (field: string, items: Items[] = []) => {
        let result: any = null;
        items.map((item: any) => {
            if (item.itemType === "group") {
                if (item.name === field) {
                    if (item) result = item;
                }
                else {
                    const r = options(field, item.items);
                    if (r) result = r;
                }
            }
            else {
                if (item.dataField === field) {
                    if (item) {
                        result = item;
                    }
                }
                else if (item.name === field) {
                    if (item) {
                        result = item;
                    }
                }
                else if (item.editorType === "buttongroup") {
                    if (isArray(item.editorOptions?.items, 0)) {
                        const findIndex = item.editorOptions?.items.findIndex((x: any) => x.name === field)
                        if (findIndex !== -1) result = item.editorOptions?.items[findIndex];
                    }
                }
            }
        });
        return result;
    }

    const changeOptions = (field: string, value: any, items: any = []) => {
        return items.map((item: any) => {
            if (item.itemType === "group") {
                if (item.name === field) {
                    return item
                }
                else {
                    return {
                        ...item,
                        items: changeOptions(field, value, item.items)
                    };
                }
            }
            else {
                if (item.dataField === field) {
                    item = value
                    return item;
                }
                else return item;
            }
        })
    }

    const itemOption = (field: string): ResItemOption => {
        let result: any = options(field, itemsState);

        return {
            option: (key, value) => {
                if (key) {
                    if (value !== undefined) {
                        try {
                            overrideValue(result, key, value);
                            const itemData = changeOptions(field, result, itemsState);
                            setItemsState(itemData.map(recursiveReMapping))
                            const valuesDefault = jsonCopy(getValues());

                            if (result?.itemType === "group") {
                                if (key.includes("disabled") || key.includes("visible") || key.includes("readOnly")) {
                                    let fieldsOnGroup: string[] = [];
                                    let itemsOnGroup: Items[] = [];
                                    const findDataField = (itms: Items[]): any => {
                                        return itms.map(im => {
                                            if (im.itemType === "group") {
                                                return {
                                                    ...im,
                                                    [key]: value ? true : false,
                                                    items: findDataField(im.items as Items[])
                                                }
                                            }
                                            else {
                                                if (im.dataField) fieldsOnGroup.push(im.dataField)
                                                return {
                                                    ...im,
                                                    editorOptions: {
                                                        ...im?.editorOptions,
                                                        [key]: value ? true : false
                                                    }
                                                }
                                            }
                                        })
                                    }

                                    itemsOnGroup = findDataField(result?.items || []);

                                    overrideValue(result, "items", itemsOnGroup);
                                    const itemData = changeOptions(field, result, itemsState);
                                    setItemsState(itemData.map(recursiveReMapping))
                                    unregister(fieldsOnGroup);
                                    clearErrors(fieldsOnGroup);
                                    fieldsOnGroup.forEach(fld => updateData(fld, valuesDefault[fld]))

                                }
                            }
                            else {
                                // @ts-ignore
                                if (key.includes("validationRules") || key.includes("disabled") || key.includes("visible") || key.includes("readOnly")) unregister(field), setError(field, {
                                    type: "validate",
                                    types: validationRules(result.validationRules, result, formControl, formRef)
                                }, { shouldFocus: true }), clearErrors(field), updateData(field, valuesDefault[field]);
                            }


                        } catch (error) {
                            error ? true : false
                            // console.log(error, "error options")
                        }
                    }
                    else return getFieldValue(result, key);
                }
                else return result;
            }
        };
    }

    const disabled = (value: boolean = true) => {
        disabledForm = value;
        let result: any = itemsState;

        let fieldsOnGroup: string[] = [];
        let itemsOnGroup: Items[] = [];
        const findDataField = (itms: Items[]): any => {
            return itms.map(im => {
                if (im.itemType === "group") {
                    return {
                        ...im,
                        ...im.disabledOld === undefined ? { disabledOld: im.disabled || false } : { disabledOld: im.disabledOld },
                        disabled: disabledForm ? true : (im.disabledOld || false),
                        items: findDataField(im.items as Items[])
                    }
                }
                else {
                    if (im.dataField) fieldsOnGroup.push(im.dataField)

                    return {
                        ...im,
                        editorOptions: {
                            ...im?.editorOptions,
                            ...im?.editorOptions?.disabledOld === undefined ? { disabledOld: im?.editorOptions?.disabled || false } : { disabledOld: im?.editorOptions?.disabledOld },
                            disabled: disabledForm ? true : (im?.editorOptions?.disabledOld || false),
                            ...im.editorOptions?.items?.length && im.editorType === "buttongroup"
                                ? {
                                    items: im.editorOptions?.items?.map(itm => {
                                        return {
                                            ...itm,
                                            ...itm.disabledOld === undefined ? { disabledOld: itm.disabled || false } : { disabledOld: itm.disabledOld },
                                            disabled: disabledForm ? true : (itm.disabledOld || false)
                                        }
                                    })
                                } : null
                        }
                    }
                }
            })
        }

        const valuesDefault = jsonCopy(getValues());
        itemsOnGroup = findDataField(result || []);
        setItemsState(itemsOnGroup.map(recursiveReMapping))
        unregister(fieldsOnGroup);
        clearErrors(fieldsOnGroup);
        fieldsOnGroup.forEach(fld => updateData(fld, valuesDefault[fld]))
    }

    const btnSubmit = (value: boolean | string, type: "visible" | "disabled" | "text" | "loading" = "visible") => {
        const { editorOptions } = itemOption("btn-submit").option() || {};
        if (editorOptions) itemOption("btn-submit").option(`editorOptions.${type}`, value)
        else itemOption("btn-submit").option(type, value)
    }

    const readOnly = (value: boolean = true) => {
        readOnlyForm = value;
        let result: any = itemsState;

        let fieldsOnGroup: string[] = [];
        let itemsOnGroup: Items[] = [];
        const findDataField = (itms: Items[]): any => {
            return itms.map(im => {
                if (im.itemType === "group") {
                    return {
                        ...im,
                        readOnly: readOnlyForm ? true : false,
                        items: findDataField(im.items as Items[])
                    }
                }
                else {
                    if (im.dataField) fieldsOnGroup.push(im.dataField)
                    return {
                        ...im,
                        editorOptions: {
                            ...im?.editorOptions,
                            readOnly: readOnlyForm ? true : false
                        }
                    }
                }
            })
        }

        const valuesDefault = jsonCopy(getValues());
        itemsOnGroup = findDataField(result || []);
        setItemsState(itemsOnGroup.map(recursiveReMapping))
        unregister(fieldsOnGroup);
        clearErrors(fieldsOnGroup);
        fieldsOnGroup.forEach(fld => updateData(fld, valuesDefault[fld]))
    }

    const componentForm = <>
        <Grid container columns={colCount} spacing={spacing}>
            {itemsState.map((item: Items, index: number) => {
                return item.visible ? <Grid item key={`${index}`} xs={colCount} md={item?.colSpan || 1} className={`${item?.className || ""}`}>
                    {renderComponent({ item, formControl, indexKey: index, formRef, apperance, loading: !name ? loadingState : loadingForm, group, spacing, showLabelShrink, showIcon })}
                </Grid> : null
            })}
        </Grid>
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
    </>

    const submitForm = async () => {
        const isValid = await trigger();
        let values: any = getDataMapping(getValues());
        // if (process.env.BUILD_ID === "development") console.log(values, "values");
        if (isValid) {
            onSubmit(values, formRef)
        }
    }

    return !formGroup ? <form ref={formElement} className={`position-relative ${className} ${loadingState && loadPanel ? "loading-form" : ""} ${errorState ? "error-form" : ""}`}
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            submitForm()
        }}
    >{componentForm}</form > : componentForm

})

export default BgsForm;