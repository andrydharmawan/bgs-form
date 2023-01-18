import moment from "moment";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { v4 } from "uuid";
import { CallbackMounted, EditorOptions, FormRef, Items, ValidationRulesModel } from "../models/form.model";

export function jsonCopy(data: any) {
    return data ? JSON.parse(JSON.stringify(data)) : null;
}

export function getFieldValue(arr: any, str: any): any {
    if (!arr) return "";
    if (str.includes(".")) return getFieldValue(arr[str.substring(0, str.indexOf("."))], str.substring(str.indexOf(".") + 1));
    return arr ? arr[str] : null;
}

export function isArray(data: any, length?: any) {
    let result = false;
    if (data) {
        if (typeof data === "object") {
            if (Array.isArray(data)) {
                if (typeof length === "number") {
                    if (data.length > length) {
                        result = true;
                    }
                } else {
                    result = true;
                }
            }
        }
    }
    return result;
}

export var sorting = {
    desc: (data: any, field: any) => {
        return data.sort((a: any, b: any) => {
            const a1 = getFieldValue(a, field) ? getFieldValue(a, field) : "";
            const b1 = getFieldValue(b, field) ? getFieldValue(a, field) : "";
            return a1 < b1 ? 1 : -1;
        });
    },
    asc: (data: any, field: any) => {
        return data.sort((a: any, b: any) => {
            const a1 = getFieldValue(a, field) ? getFieldValue(a, field) : "";
            const b1 = getFieldValue(b, field) ? getFieldValue(b, field) : "";
            return a1 > b1 ? 1 : -1;
        })
    }
}

export const split = {
    camelCase: (value: string = "") => {
        value = value.split(".").map(val => {
            val = val.charAt(0).toUpperCase() + val.slice(1)
            return val
        }).join(" ")
        value = value.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}



export const validationRules = (validationRules: ValidationRulesModel[] = [], item: any, formControl: UseFormReturn, formRef: FormRef) => {
    let validations: any[] = [];
    let validate: any = {};
    const { label = {}, dataField, editorType, editorOptions } = item || {};
    const { mode } = editorOptions || {};
    const { text = dataField ? split.camelCase(dataField) : "" } = label || {};
    const { getValues } = formControl;


    if (editorType === "date") {
        const { format }: EditorOptions = editorOptions || {};
        const { value: valueFormat } = format || {};
        const singleComponent: string[] = ["date", "time", "datetime"];
        const message = `${text.split("|").join(" and ")} format not valid`;

        if (singleComponent.includes(mode) || !mode) {
            validate = {
                ...validate,
                [v4()]: (value: any) => {
                    let condition = true;
                    const mapFormat: any = valueFormat;
                    const setFormat = (value: any, mapFormat: any) => {
                        if (typeof value === "object") return value;
                        else return new Date(moment(value, mapFormat).format("MM/DD/YYYY HH:mm:ss"))
                    }

                    if (value) condition = moment(setFormat(value, mapFormat)).isValid();

                    return condition || message;
                }
            }
        }
        else {
            validate = {
                ...validate,
                [v4()]: (value: any) => {
                    let condition = true;
                    const mapFormat: any = valueFormat;
                    const setFormat = (value: any, mapFormat: any) => {
                        if (typeof value === "object") return value;
                        else return new Date(moment(value, mapFormat).format("MM/DD/YYYY HH:mm:ss"))
                    }

                    if (value) {
                        condition = (value[0] ? moment(setFormat(value[0], mapFormat)).isValid() : true) && (value[1] ? moment(setFormat(value[1], mapFormat)).isValid() : true);
                    }

                    return condition || message;
                }
            }
        }
    }

    validationRules?.forEach((type) => {
        if (typeof type === "object") {
            if (type.type === "pattern") {
                let pattern: any = type.validation || {}
                validate = {
                    ...validate,
                    pattern: (value: any = "") => pattern.test(value) || `${text} ${type.message}`,
                }
            }
            else {
                validate = {
                    ...validate,
                    [v4()]: (value: any) => typeof type.validation === "function" ? (type.validation(value, formRef) || type.message) : null
                }
            }
        }
        else {
            const valType: any = type.split(".");

            switch (valType[0]) {
                case "required":
                    const message: string = `${text.split("|").join(" and ")} is required`;
                    if (editorType === "date") {
                        if (mode === "range") validate = {
                            ...validate,
                            [v4()]: (value: any) => {
                                let condition = true;

                                if (value) {
                                    condition = value[0] && value[1] ? true : false;
                                }
                                else condition = false;

                                return condition || message;
                            }
                        }
                        else {
                            validations.push({
                                required: {
                                    value: true,
                                    message
                                }
                            })
                        }
                    }
                    else validations.push({
                        required: {
                            value: true,
                            message
                        }
                    })
                    break;
                case "minLength":
                    validations.push({
                        minLength: {
                            value: valType[1],
                            message: `${text} must be at least ${valType[1]} characters long`
                        }
                    })
                    break;
                case "maxLength":
                    validations.push({
                        maxLength: {
                            value: valType[1],
                            message: `${text} cannot be more than ${valType[1]} characters long`
                        }
                    })
                    break;
                case "min":
                    validations.push({
                        min: {
                            value: Number(valType[1] || 0),
                            message: `${text} should be at least ${valType[1]}`
                        }
                    })
                    break;
                case "max":
                    validations.push({
                        max: {
                            value: Number(valType[1] || 0),
                            message: `${text} should be at most ${valType[1]}`
                        }
                    })
                    break;
                case "email":
                    validate = {
                        ...validate,
                        email: (value: any = "") => value ? (value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) || `${text} must be type email`) : true,
                    }
                    break;
                case "match":
                    validate = {
                        ...validate,
                        match: (value: any = "") => value ? (value === getValues(valType[1]) || `${text} must be same with ${split.camelCase(valType[1])}`) : true,
                    }
                    break;
                case "different":
                    validate = {
                        ...validate,
                        different: (value: any = "") => value ? (!(value === getValues(valType[1])) || `${text} must be different with ${split.camelCase(valType[1])}`) : true,
                    }
                    break;
                case "pattern":
                    let pattern: any = "";
                    if (valType[1] == "alphabet") pattern = {
                        pattern: new RegExp("^[A-Za-z ]*$"),
                        message: "must be format Alphabet"
                    }
                    else if (valType[1] == "phonenumber") pattern = {
                        pattern: new RegExp("^[+]?[0-9]*$"),
                        message: "must be format Phone Number"
                    }
                    else if (valType[1] == "alphanumber") pattern = {
                        pattern: new RegExp("^[A-Za-z0-9 ]*$"),
                        message: "must be format Alphabet or Number"
                    }
                    else if (valType[1] == "name") pattern = {
                        pattern: new RegExp("^[A-Za-z0-9 '-.]*$"),
                        message: "must be format Alphabet or ' - ."
                    }
                    else if (valType[1] == "number") pattern = {
                        pattern: new RegExp("^[0-9]*$"),
                        message: "must be format Number"
                    }
                    else if (valType[1] == "lowerspace") pattern = {
                        pattern: new RegExp("^[a-z0-9]*$"),
                        message: "must be format Lowercase and without space"
                    }
                    else if (valType[1] == "alphanumberspace") pattern = {
                        pattern: new RegExp("^[A-Za-z0-9]*$"),
                        message: "must be format Alphabet or Number without space"
                    }
                    else if (valType[1] == "lowercase") pattern = {
                        pattern: new RegExp("^[a-z0-9 ]*$"),
                        message: "must be format Lowercase"
                    }
                    else if (valType[1] == "alphanumberunderdash") pattern = {
                        pattern: new RegExp("^[A-Za-z0-9_-]*$"),
                        message: "must be format Alphabet, Number or _-"
                    }

                    validate = {
                        ...validate,
                        pattern: (value: any = "") => pattern.pattern.test(value) || `${text} ${pattern.message}`,
                    }

                    break;
                default:
            }
        }
    });

    if (Object.keys(validate).length) validations.push({ validate })

    return Object.assign({}, ...validations)
}

export const overrideValue = (obj: any, is: string | any[], value: any = undefined): any => {
    if (typeof is == 'string') {
        return overrideValue(obj, is.split('.'), value);
    }
    else if (is.length == 1 && value !== undefined) {
        return obj[is[0]] = value;
    }
    else if (is.length == 0) {
        return obj;
    }
    else {
        return overrideValue(obj[is[0]], is.slice(1), value);
    }
}

export function horizontalAlignmentClass(value: "left" | "right" | "center" = "left") {
    switch (value) {
        case "left":
            return "justify-content-start";
        case "right":
            return "justify-content-end";
        case "center":
            return "justify-content-center";
    }
}

export function verticalAlignmentClass(value: "center" | "bottom" | "top" = "center") {
    switch (value) {
        case "center":
            return "align-items-center";
        case "bottom":
            return "align-items-end";
        case "top":
            return "align-items-start";
    }
}

export function formatCurrency(value: number | string = 0) {
    value = typeof value === "number" ? value.toString() : value;

    var dpos = value.indexOf(",");
    var nStrEnd = '';

    if (dpos !== -1) {
        nStrEnd = "," + value.substring(dpos + 1, value.length);
        value = value.substring(0, dpos);
    }

    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(value)) {
        value = value.replace(rgx, "$1.$2");
    }
    return `${value}${nStrEnd}`;
}

export const recursiveReMapping = (formRef: FormRef, disabledForm: boolean, readOnlyForm: boolean, item: string | Items | null, index?: number, array?: any, parent?: Items): Items => {
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

        if (!propertyField?.label?.text && propertyField?.dataField) propertyField.label = { ...propertyField?.label, text: split.camelCase(propertyField?.dataField) }

        return recursiveReMapping(formRef, disabledForm, readOnlyForm, propertyField, index, array, parent);
    }
    else if (item === null && typeof item === "object") {
        return recursiveReMapping(formRef, disabledForm, readOnlyForm, {
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
            items: items.map((itemChild: any, index: number, array: any) => recursiveReMapping(formRef, disabledForm, readOnlyForm, itemChild, index, array, item))
        }
        else {
            const { disabled: disabledGroup = disabledForm || false, visible: visibleGroup = true, readOnly: readOnlyGroup = readOnlyForm || false } = parent || {};
            let { label, dataField, editorOptions, validationRules = [], visible: visibleItem = typeof visibleGroup === "undefined" ? true : visibleGroup } = item;
            let { format, mode = "date", disabled = disabledGroup || false, readOnly = readOnlyGroup || false, visible = true } = editorOptions || {};

            if (!label?.text && dataField) label = { text: split.camelCase(dataField), ...label }

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
                    default:
                        displayFormat = "DD MMM YYYY";
                        valueFormat = "YYYY-MM-DD";
                        break;
                }

                const { editorOptions: editorOptionsOld } = options(item.dataField || "", []) || {};
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
                            return {
                                ...itCh,
                                disabled: itCh.disabled || disabled,
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
                ...editorType === "select" ? {
                    ...item.refresh ? item.refresh : {
                        refresh: () => {
                            formRef.itemOption(item?.dataField || "select").option("key", v4())
                        }
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
                    isProcess: false
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
export const options = (field: string, items: Items[] = []) => {
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

export function summary(data: any[], field: string, isAmount: boolean = false) {
    const result = data ? (data.length > 0 ? data.map(item => {
        return getFieldValue(item, field);
    }).reduce((total, num) => {
        return total + num;
    }) : 0) : 0;

    return isAmount ? formatCurrency(result) : result;
}

export function valueDataType(value: string = "", item?: Items) {
    if (!value || !item?.dataType) return "";

    switch (item?.dataType) {
        case "boolean":
            value = value ? "true" : "false"
            break;
        case "date":
            value = moment(value).format(item?.format?.display || "DD MMM YYYY")
            break;
        case "datetime":
            value = moment(value).format(item?.format?.display || "DD MMM YYYY HH:mm")
            break;
        case "time":
            const { value: valueFormat = "HH:mm" } = item?.format || {};
            value = moment(value, valueFormat).format(item?.format?.display || "HH:mm")
            break;
        case "number":
            value = formatCurrency(value)
            break;
    }
    return value;
}

export const reorder = (
    list: any,
    startIndex: number,
    endIndex: number
): any => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};