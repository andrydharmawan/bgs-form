import { FormRef, PropsForm } from "../models/form.model";
import { Controller } from "react-hook-form";
import { v4 } from "uuid";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { getFieldValue, isArray, jsonCopy, recursiveReMapping, validationRules } from "../lib";
import { ResponseModel } from "../models/models";
import BgsSpinner from "./spinner";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import { TextField } from "@mui/material";
import React from "react";
import Autocomplete from '@mui/material/Autocomplete';
import { BgsLabel } from "./input";

interface DataSourceModel {
    displayExpr: string;
    valueExpr: string;
    data: any;
}
const BgsAutoComplete = forwardRef(({
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

    const { label, editorOptions, dataField = v4(), validationRules: validation = [], visible: visibleItem, key = dataField, editorType } = item;
    const labelVisible = typeof label?.visible === "undefined" ? true : label?.visible;
    let {
        disabled,
        readOnly,
        visible = visibleItem,
        parameterFromField,
        // @ts-ignore
        isFirstLoad = true,
        search: searchOptions,
        sorting,
        defaultParameter: defaultParameterOptions,
        prefix,
        onChange: onChangeOptions = () => { },
    } = editorOptions || {};
    const { control, getValues, watch, setValue } = formControl;
    const defaultValue = getValues(dataField);

    const [dataSourceState, setDataSourceState] = useState<DataSourceModel[]>([]);
    const [pageState, setPageState] = useState<number>(1);
    const [limitState, setLimitState] = useState<number>(50);
    const [loading, setLoading] = useState<boolean>(false);
    const [statusState, setStatusState] = useState<boolean>(true);
    const [messageError, setMessageError] = useState<string>("");
    const [search, setSearch] = useState<string | null>(null);
    const [isNew, setIsNew] = useState<boolean>(false);

    useEffect(() => {
        if (key !== dataField || defaultValue) isFirstLoad = true, setIsNew(true), setPageState(1), setLimitState(limitState + 1);
    }, [key])

    useEffect(() => {
        if (search) {
            refresh()
        }

        formRef.itemOption(dataField).option("refresh", () => {
            setIsNew(true);
            setPageState(1);
            setLimitState(limitState + 1);
        });
    }, [pageState, limitState, search])

    useEffect(() => {
        if (dataSourceState.length) formRef.itemOption(dataField).option("getDataSource", () => dataSourceState);
    }, [dataSourceState, loading, watch(dataField)])

    const refresh = async () => {
        const {
            helper,
            dataSource = [],
            parameter
        } = editorOptions || {};

        if (loading) return;

        setLoading(true)

        if (helper) {
            let isValid = !(parameterFromField && parameterFromField.length);
            const defaultParameter = parameterFromField && parameterFromField.length ? ({ getData }: FormRef) => {
                let param: any = {}
                if (parameterFromField) parameterFromField.forEach(({ opt, fromField, propReq }) => {
                    param = {
                        ...param,
                        [opt]: {
                            ...param[opt],
                            ...getData(fromField) ? { [propReq]: getData(fromField) } : null
                        }
                    }
                })
                return param;
            } : () => { return {} }

            if (!isValid && parameterFromField && parameterFromField.length) {
                let total = parameterFromField.length;
                parameterFromField.forEach(({ fromField }) => {
                    if (formRef.getData(fromField)) total -= 1;
                });
                if (total > 0) return setLoading(false);
            }

            const param: any = parameter ? (parameter(formRef) || defaultParameter(formRef)) : defaultParameter(formRef);

            let searchby: any = {},
                sort: any = {},
                defaultFilter: any = {
                    data: {},
                    criteria: {},
                    filter: {},
                    sort: {}
                };

            if (searchOptions) {
                if (typeof searchOptions === "object") {
                    if (!Array.isArray(searchOptions) && search && searchOptions?.enabled) {
                        const { propReq } = searchOptions || {};
                        if (propReq) {
                            if (typeof propReq === "string") searchby[propReq] = `${search}`;
                            else propReq.forEach(field => {
                                searchby[field] = `${search}`;
                            })
                        }
                    }
                    else if (Array.isArray(searchOptions) && isArray(searchOptions, 0) && search) {
                        searchOptions.forEach(field => searchby[field] = `${search}`)
                    }
                }
                else if (typeof searchOptions === "string") searchby[searchOptions] = `${search}`
            }

            if (sorting) {
                if(typeof sorting === "object"){
                    if(!Array.isArray(sorting)) {
                        if (sorting?.enabled) {
                            if (typeof sorting?.detail === "object" && Array.isArray(sorting?.detail)) sorting?.detail.forEach(({ propReq, opt }) => {
                                sort[propReq] = opt;
                            })
                            else {
                                sort[sorting?.detail.propReq] = sorting?.detail.opt;
                            }
                        }
                    }
                    else if (Array.isArray(sorting) && isArray(sorting, 0)) sorting.forEach(value =>  sort[value.split(".")[0]] = value.split(".")[1])
                }
                else if (typeof sorting === "string") sort[sorting.split(".")[0]] = sorting.split(".")[1]
            }

            if (defaultParameterOptions?.length) {
                isValid = !defaultParameterOptions.length;
                let total = defaultParameterOptions.length;
                defaultParameterOptions.forEach(({ value }) => {
                    if (typeof value === "function") {
                        if (value() !== undefined) total -= 1;
                    }
                    else {
                        if (value !== undefined) total -= 1;
                    }
                });
                if (total > 0) return setLoading(false);

                defaultParameterOptions?.forEach(item => {
                    if (typeof item.value === "function") {
                        if (item.value() !== undefined) defaultFilter[item.opt][item.propReq] = item.value();
                    }
                    else {
                        if (item.value !== undefined) defaultFilter[item.opt][item.propReq] = item.value;
                    }
                });
            }
            const { status, data, paging, message }: ResponseModel = await helper({
                parameter: {
                    column: [],
                    ...param,
                    criteria: {
                        ...param.criteria,
                        ...search && searchOptions ? searchby : null,
                        ...defaultFilter.criteria
                    },
                    filter: {
                        ...param.filter,
                        ...defaultFilter.filter
                    },
                    data: {
                        ...param.data,
                        ...defaultFilter.data
                    },
                    sort: {
                        ...sort,
                        ...defaultFilter.sort
                    }
                },
                paging: {
                    limit: limitState,
                    page: pageState
                }
            })
            // @ts-ignore
            const { totalrecord = 0 } = paging || {};
            const dataSrc = status && isArray(data, 0) ? data.map(remapDataSource) : [];
            setDataSourceState(status ? isNew ? dataSrc : [...dataSourceState, ...dataSrc] : [])
            setStatusState(status)
            setMessageError(status ? "" : message)
            setLoading(false)
            setIsNew(false)
        }
        else {
            if (isArray(dataSource, 0) && dataSource) {
                let dataSrc: any = jsonCopy(dataSource) || [];

                setDataSourceState(dataSrc.map(remapDataSource))
            }
            setLoading(false)
        }
    }

    const remapDataSource = (d: any, i: any) => {
        const {
            displayExpr,
            valueExpr
        } = editorOptions || {};

        if (typeof (d) !== "object") return {
            displayExpr: d,
            valueExpr: d,
            data: d
        }
        else return {
            displayExpr: typeof displayExpr !== "function" ? getFieldValue(d, displayExpr || "text") : displayExpr(d, i),
            valueExpr: getFieldValue(d, valueExpr || "value"),
            data: d
        }
    }

    let timer: any = null;

    return <Controller
        name={dataField}
        control={control}
        rules={!visible || disabled || readOnly ? {} : validationRules(validation, item, formControl, formRef)}
        render={({
            field: { onChange, onBlur, ref, value = null },
            fieldState: { invalid, error },
        }) => (
            <div>
                <Autocomplete
                    freeSolo
                    options={dataSourceState.map(x => x.displayExpr)}
                    // @ts-ignore
                    onChange={(event, newValue) => {
                        const data = dataSourceState.find(x => x.valueExpr === newValue)
                        onChangeOptions({
                            value: newValue,
                            formRef,
                            data
                        });
                        setValue(dataField, newValue)
                    }}
                    value={value}
                    renderInput={(params) => <TextField
                        {...params}
                        key={dataField}
                        value={value}
                        variant={apperance}
                        size="small"
                        inputRef={ref}
                        className={`bgs-input`}
                        onBlur={onBlur}
                        error={invalid}
                        disabled={disabled}
                        helperText={error?.message || label?.hint}
                        onKeyDown={e => {
                            if (e.keyCode === 13) {
                                const data = dataSourceState.find(x => x.valueExpr === value)
                                if (data) {
                                    onChangeOptions({
                                        value,
                                        formRef,
                                        data
                                    });
                                    setValue(dataField, value)
                                }
                            }
                        }}
                        onChange={(event: any) => {
                            if (event.target.value) {
                                clearTimeout(timer)
                                timer = setTimeout(() => { setIsNew(true), setSearch(event.target.value), setPageState(1) }, 800);
                                event.preventDefault()
                            }
                            else setDataSourceState([])

                            onChangeOptions({
                                value: event.target.value,
                                formRef,
                                data: null
                            });

                            onChange(event)
                        }}
                        {...labelVisible ? {
                            label: <BgsLabel label={label} showIcon={showIcon} validation={validation} editorType={editorType} editorOptions={editorOptions} formControl={formControl} dataField={dataField} />
                        } : { label: "" }}
                        InputLabelProps={{
                            ...params.InputLabelProps,
                            ...showLabelShrink ? { shrink: true } : {},
                        }}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: <>
                                {prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null}
                            </>,
                            endAdornment: loading ? <BgsSpinner /> : (!statusState ? <InputAdornment position="end"><Tooltip title={messageError}><ErrorOutlineIcon color="error" /></Tooltip></InputAdornment> : null),
                            // (value && <BgsButton variant="icon" onClick={() => {
                            //     formRef.reset(dataField)
                            //     onChangeOptions({
                            //         value: null,
                            //         formRef,
                            //         data: null
                            //     });
                            // }}>
                            //     <ClearIcon />
                            // </BgsButton>)
                        }}
                    />}
                />
            </div>
        )}
    />
})

export default BgsAutoComplete;