import { FormRef, PropsForm } from "../models/form.model";
import { Controller } from "react-hook-form";
import { v4 } from "uuid";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { getFieldValue, isArray, jsonCopy, recursiveReMapping, validationRules } from "../lib";
import { ResponseModel, TableModel } from "../models/models";
import BgsSpinner from "./spinner";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import BgsButton from "./button";
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Menu, TextField } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import React from "react";
import SearchIcon from '@mui/icons-material/Search';
import Paper from "@mui/material/Paper";
import Fade from '@mui/material/Fade';
import bgsModal from "../modal/modal";
import BgsTable from "../table/table";
import ClearIcon from '@mui/icons-material/Clear';
import { BgsLabel } from "./input";
// import ModalListSelected from "./modallistselected";

interface DataSourceModel {
    displayExpr: string;
    valueExpr: string;
    data: any;
}
const BgsSelect = forwardRef(({
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
        isAlwaysNew,
        parameterFromField,
        afterChange,
        mode = "default",
        isFirstLoad = true,
        search: searchOptions,
        sorting,
        defaultParameter: defaultParameterOptions,
        showArrow: showArrowOptions = true,
        suffix,
        prefix,
        onChange: onChangeOptions = () => { },
        placeholder,
        renderOption,
        width: widthOptions,
        disabledOption = [],
        multiple = false,
        afterRefresh = () => { },
        allowSelectAll = false
    } = editorOptions || {};
    const { control, getValues, watch, setValue } = formControl;
    const defaultValue = getValues(dataField);
    const refInput = useRef<HTMLInputElement>(null)

    const [dataSourceState, setDataSourceState] = useState<DataSourceModel[]>([]);
    const [pageState, setPageState] = useState<number>(1);
    const [limitState, setLimitState] = useState<number>(50);
    const [totalRecordState, setTotalRecordState] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [statusState, setStatusState] = useState<boolean>(true);
    const [messageError, setMessageError] = useState<string>("");
    const [search, setSearch] = useState<string | null>(null);
    const [isNew, setIsNew] = useState<boolean>(false);
    const [dataSelected, setDataSelected] = useState<DataSourceModel[]>([]);
    const [dataDisabledSelected, setDataDisabledSelected] = useState<string[]>(disabledOption);

    const focusSelected = () => {
        setTimeout(() => {
            if (dataSelected.length) {
                const selectedFocus: any = document.querySelectorAll('.selected-item');
                if (selectedFocus.length) selectedFocus[0]?.focus();
            }
            setTimeout(() => {
                refInput.current?.focus()
            }, 100)
        }, 200)
    }

    useEffect(() => {
        if (key !== dataField || defaultValue) isFirstLoad = true, setIsNew(true), setPageState(1), setLimitState(limitState + 1);
    }, [key])

    useEffect(() => {
        if (mode === "default") {
            // if (isFirstLoad || key !== dataField || defaultValue) 

            if (isFirstLoad) refresh()
        }

        formRef.itemOption(dataField).option("refresh", () => {
            setIsNew(true);
            setPageState(1);
            setLimitState(limitState + 1);
        });

        formRef.itemOption(dataField).option("setDisabledOption", (key: string[]) => {
            setDataDisabledSelected(key)
        });
    }, [pageState, limitState, search])

    useEffect(() => {
        if (dataSourceState.length) formRef.itemOption(dataField).option("getDataSource", () => dataSourceState);
        if (!loading) checkIsExist();
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
                if (typeof sorting === "object") {
                    if (!Array.isArray(sorting)) {
                        if (sorting?.enabled) {
                            if (typeof sorting?.detail === "object" && Array.isArray(sorting?.detail)) sorting?.detail.forEach(({ propReq, opt }) => {
                                sort[propReq] = opt;
                            })
                            else {
                                sort[sorting?.detail.propReq] = sorting?.detail.opt;
                            }
                        }
                    }
                    else if (Array.isArray(sorting) && isArray(sorting, 0)) sorting.forEach(value => sort[value.split(".")[0]] = value.split(".")[1])
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
            const { totalrecord = 0 } = paging || {};
            setTotalRecordState(totalrecord)
            const dataSrc = status && isArray(data, 0) ? data.map(remapDataSource) : [];
            setDataSourceState(status ? isNew ? dataSrc : [...dataSourceState, ...dataSrc] : [])
            setStatusState(status)
            setMessageError(status ? "" : message)
            setLoading(false)
            setIsNew(false)
            afterRefresh({
                data: dataSrc,
                formRef
            })
        }
        else {
            if (isArray(dataSource, 0) && dataSource) {
                let dataSrc: any = jsonCopy(dataSource) || [];

                setTotalRecordState(dataSource.length)
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

    const checkIsExist = async () => {
        if (!multiple) {
            if (defaultValue) {
                const findData = dataSourceState.find(x => x.valueExpr === defaultValue);
                if (!findData && !dataSelected.find(y => y.valueExpr === defaultValue)) {// && dataSelected?.valueExpr !== defaultValue
                    const {
                        helper,
                        valueExpr
                    } = editorOptions || {};
                    if (helper && valueExpr) {
                        if (loading) return;
                        let { status, data }: ResponseModel = await helper({
                            parameter: {
                                column: [],
                                filter: {
                                    [valueExpr]: defaultValue
                                }
                            },
                            paging: {
                                limit: limitState,
                                page: 1
                            }
                        })
                        if (status && isArray(data, 0)) {
                            data = data.map(remapDataSource);
                            setDataSelected([data[0]])
                            if (!dataSourceState.length) formRef.itemOption(dataField).option("key", v4())
                            setOptionSelectedValue(!multiple ? data[0] : [data[0]])//update disini
                        }
                    }
                }
                else if (findData) setOptionSelectedValue(!multiple ? findData : [findData])//update disini
            }
        }
        else {
            if (isArray(defaultValue, 0)) {
                const findData = dataSourceState.filter(x => defaultValue.includes(x.valueExpr));
                if ((findData.length !== defaultValue.length) && !dataSelected.find(y => y.valueExpr === defaultValue)) {
                    const {
                        helper,
                        valueExpr
                    } = editorOptions || {};
                    if (helper && valueExpr) {
                        if (loading) return;
                        let { status, data }: ResponseModel = await helper({
                            parameter: {
                                column: [],
                                filter: {
                                    [valueExpr]: defaultValue
                                }
                            },
                            paging: {
                                limit: limitState,
                                page: 1
                            }
                        })
                        if (status && isArray(data, 0)) {
                            data = data.map(remapDataSource);
                            setDataSelected(data)
                            if (!dataSourceState.length) formRef.itemOption(dataField).option("key", v4())
                            setOptionSelectedValue(!multiple ? data[0] : data)//belum yakin//update disini
                        }
                    }
                }
                else if (findData) {
                    setDataSelected(findData)
                    setOptionSelectedValue(!multiple ? findData : [findData])
                }//update disini
                // else if (findData) setOptionSelectedValue(!multiple ? findData : [findData])//update disini
            }
        }
    }

    const setOptionSelectedValue = (data: any) => {
        formRef.itemOption(dataField).option("selectedValue", data);
        formRef.itemOption(dataField).option("getDataSelected", () => data);
    }

    const selectValue = (value: any = undefined): any => {
        if (!multiple) {
            const findData = dataSourceState.find(x => x.valueExpr === value)
            if (findData) {
                if (!findData.valueExpr) return ""

                return findData.displayExpr;
            }
            else {
                const { displayExpr } = dataSelected.find(x => x.valueExpr === value) || {}
                if (displayExpr) return displayExpr;
            }
            return ""
        }
        else {
            return dataSelected.map(x => x.displayExpr).join(", ")
        }
    }

    let timer: any = null;

    const [width, setWidth] = useState<number>(0);

    const rounded = (val: number) => {
        const round = 500 * pageState;
        return Math.round(val / round) * round;
    }

    const selectAll = async (value: any = []) => {
        if (value?.length === totalRecordState) {
            setValue(dataField, null)
            setDataSelected([])
            if (search) {
                setIsNew(true)
                setSearch(null)
            }
            onChangeOptions({
                value: null,
                data: null,
                formRef
            })

            setOptionSelectedValue(null)

            if (afterChange?.clearItems?.length) formRef.reset(afterChange?.clearItems);
            if (afterChange?.reloadItems?.length) afterChange?.reloadItems.forEach(field => formRef.itemOption(field).option("key", v4()));
        }
        else {
            const {
                helper,
                dataSource = [],
                parameter
            } = editorOptions || {};

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
                    if (typeof sorting === "object") {
                        if (!Array.isArray(sorting)) {
                            if (sorting?.enabled) {
                                if (typeof sorting?.detail === "object" && Array.isArray(sorting?.detail)) sorting?.detail.forEach(({ propReq, opt }) => {
                                    sort[propReq] = opt;
                                })
                                else {
                                    sort[sorting?.detail.propReq] = sorting?.detail.opt;
                                }
                            }
                        }
                        else if (Array.isArray(sorting) && isArray(sorting, 0)) sorting.forEach(value => sort[value.split(".")[0]] = value.split(".")[1])
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
                const { status, data, message }: ResponseModel = await helper({
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
                        limit: totalRecordState,
                        page: 1
                    }
                })
                setLoading(false)
                // setIsNew(false)
                setStatusState(status)
                setMessageError(status ? "" : message)
                const selectedData: DataSourceModel[] = status && isArray(data, 0) ? data.map(remapDataSource) : [];
                setValue(dataField, selectedData.map(x => x.valueExpr))
                setDataSelected(selectedData)
                // if (search) {
                //     setIsNew(true)
                //     setSearch(null)
                // }
                onChangeOptions({
                    value: selectedData.map(x => x.valueExpr),
                    data: selectedData.map(x => x.data),
                    formRef
                })

                setOptionSelectedValue(selectedData)

                if (afterChange?.clearItems?.length) formRef.reset(afterChange?.clearItems);
                if (afterChange?.reloadItems?.length) afterChange?.reloadItems.forEach(field => formRef.itemOption(field).option("key", v4()));
            }
            else {
                if (isArray(dataSource, 0) && dataSource) {
                    let dataSrc: any = jsonCopy(dataSource) || [];

                    const selectedData: DataSourceModel[] = isArray(dataSrc, 0) ? dataSrc.map(remapDataSource) : [];
                    setValue(dataField, selectedData.map(x => x.valueExpr))
                    setDataSelected(selectedData)
                    // if (search) {
                    //     setIsNew(true)
                    //     setSearch(null)
                    // }
                    onChangeOptions({
                        value: selectedData.map(x => x.valueExpr),
                        data: selectedData.map(x => x.data),
                        formRef
                    })

                    setOptionSelectedValue(selectedData)

                    if (afterChange?.clearItems?.length) formRef.reset(afterChange?.clearItems);
                    if (afterChange?.reloadItems?.length) afterChange?.reloadItems.forEach(field => formRef.itemOption(field).option("key", v4()));

                }
                setLoading(false)
            }
        }
    }

    const showModalTable = (onBlur: any) => {
        bgsModal({
            width: "80%",
            minHeight: "70%",
            ...editorOptions?.modalOptions,
            render: ({ hide }) => {
                const {
                    helper,
                    dataSource,
                    parameter,
                    valueExpr = ""
                } = editorOptions || {};

                const table: TableModel = {
                    title: "Choose Data",
                    ...!multiple && {
                        onRowClick: ({ rowData }) => {
                            const selected = remapDataSource(rowData, 0)
                            if (!selected.valueExpr || dataDisabledSelected.includes(selected.valueExpr)) return;
                            setValue(dataField, selected.valueExpr);
                            setDataSelected([selected])
                            onChangeOptions({
                                value: selected.valueExpr,
                                data: rowData,
                                formRef
                            })

                            setOptionSelectedValue(selected)

                            if (afterChange?.clearItems?.length) formRef.reset(afterChange?.clearItems);
                            if (afterChange?.reloadItems?.length) afterChange?.reloadItems.forEach(field => formRef.itemOption(field).option("key", v4()));
                            hide()
                            onBlur()
                        }
                    },
                    ...helper ? { helper: (data: any) => helper(data) } : null,
                    ...dataSource ? { dataSource } : null,
                    parameter,
                    height: "calc(100vh - 270px)",
                    allowFilteringShow: false,
                    ...editorOptions?.tableOptions as any,
                    allowSelection: {
                        enabled: true,
                        mode: multiple ? "multiple" : "single",
                        selected: dataSelected.map(x => x.valueExpr)
                    },
                    keyData: valueExpr,
                    ...multiple ? {
                        buttonSelect: {
                            onClick: ({ tableRef }) => {
                                const selected = tableRef.getSelection().data.map(remapDataSource)
                                setValue(dataField, selected.map(x => x.valueExpr));
                                setDataSelected(selected)
                                onChangeOptions({
                                    value: selected.map(x => x.valueExpr),
                                    data: selected.map(x => x.data),
                                    formRef
                                })

                                setOptionSelectedValue(selected)

                                if (afterChange?.clearItems?.length) formRef.reset(afterChange?.clearItems);
                                if (afterChange?.reloadItems?.length) afterChange?.reloadItems.forEach(field => formRef.itemOption(field).option("key", v4()));
                                hide()
                                onBlur()
                            }
                        }
                    } : null
                }
                return <div className="scroll p-3" style={{ height: "calc(100vh - 131px)", overflowX: "auto" }} >
                    <BgsTable {...table as any} />
                </div >
            }
        })
    }

    return <div className="bgs-select">
        <Controller
            name={dataField}
            control={control}
            rules={!visible || disabled || readOnly ? {} : validationRules(validation, item, formControl, formRef)}
            render={({
                field: { onBlur, ref, value = null },
                fieldState: { invalid, error },
            }) => (
                <div>
                    <PopupState variant="popper">
                        {(popupState) => (
                            <React.Fragment>
                                <TextField
                                    placeholder={placeholder}
                                    value={selectValue(value)}
                                    disabled={disabled}
                                    error={invalid}
                                    inputRef={ref}
                                    {...labelVisible ? {
                                        label: <BgsLabel label={label} showIcon={showIcon} validation={validation} editorType={editorType} />
                                    } : { label: "" }}
                                    helperText={error?.message || label?.hint}
                                    // variant="outlined"
                                    variant={apperance}
                                    InputLabelProps={showLabelShrink ? {
                                        shrink: true,
                                    } : {}}
                                    fullWidth
                                    onClick={(e) => {
                                        if (disabled || readOnly) return;
                                        if (mode === "popup") {
                                            showModalTable(onBlur)
                                        }
                                        else {
                                            setWidth(e.currentTarget.clientWidth)
                                            bindTrigger(popupState).onClick(e)
                                            focusSelected()
                                        }
                                    }}
                                    onBlur={onBlur}
                                    onKeyDown={(e) => {
                                        //27 esc
                                        //38 up
                                        //40 down
                                        const { keyCode } = e;
                                        if ([27, 38, 40].includes(keyCode)) {
                                            if (mode === "popup") {
                                                showModalTable(onBlur)
                                            }
                                            else {
                                                bindTrigger(popupState).onClick(e as any)
                                                focusSelected()
                                                setWidth(e.currentTarget.clientWidth)
                                            }
                                        }
                                    }}
                                    InputProps={{
                                        readOnly: true,
                                        inputProps: {
                                            autoComplete: 'disabled',
                                        },
                                        className: `${editorOptions?.className}`,
                                        endAdornment: <>
                                            {editorOptions?.allowClear && value && (!disabled && !readOnly) ? <BgsButton className="transparant" onClick={({ event }) => {
                                                event.preventDefault();
                                                formRef.reset(dataField)
                                                onChangeOptions({
                                                    value: null,
                                                    data: null,
                                                    formRef
                                                })

                                                setOptionSelectedValue(null)

                                                if (afterChange?.clearItems?.length) formRef.reset(afterChange?.clearItems);
                                                if (afterChange?.reloadItems?.length) afterChange?.reloadItems.forEach(field => formRef.itemOption(field).option("key", v4()));
                                                event.stopPropagation();
                                            }} title="Clear" variant="icon"><ClearIcon /></BgsButton> : null}
                                            {showArrowOptions ? (mode === "popup" ? <SearchIcon
                                                sx={{
                                                    fontSize: "24px !important",
                                                    color: "#9c9999"
                                                }}
                                            /> : <ArrowDropDownIcon
                                                sx={{
                                                    transform: popupState.isOpen ? 'rotate(-180deg)' : 'rotate(0)',
                                                    transition: '0.2s',
                                                    fontSize: "24px !important",
                                                    color: "#9c9999"
                                                }}
                                            />) : null}
                                            {suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : null}
                                        </>,
                                        ...(prefix || loading || !statusState) ? {
                                            startAdornment: <>
                                                {prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null}
                                                {loading ? <BgsSpinner /> : (!statusState ? <InputAdornment position="start"><Tooltip title={messageError}><ErrorOutlineIcon color="error" /></Tooltip></InputAdornment> : null)}
                                            </>
                                        } : null,
                                        ...!statusState ? {
                                            endAdornment: <Tooltip title="Refresh">
                                                <BgsButton
                                                    variant="icon"
                                                    className="me-2"
                                                    onClick={() => refresh()}
                                                >
                                                    <RefreshIcon />
                                                </BgsButton>
                                            </Tooltip>
                                        } : {}
                                    }}
                                />
                                <Menu
                                    {...bindMenu(popupState)}
                                    TransitionComponent={Fade}
                                    {...searchOptions ? {
                                        anchorOrigin: {
                                            vertical: 'top',
                                            horizontal: 'left',
                                        }
                                    } : null}
                                    onClose={() => {
                                        setIsNew(true)
                                        setSearch(null)
                                        popupState.close();
                                    }}
                                    MenuListProps={{
                                        style: {
                                            padding: 0,
                                            position: "relative",
                                            overflow: "visible",
                                            backgroundColor: "transparent"
                                        }
                                    }}
                                    PaperProps={{
                                        style: {
                                            width: width + 1,
                                            maxHeight: "40%",
                                            paddingTop: 0,
                                            position: "relative",
                                            overflow: "visible",
                                            backgroundColor: "transparent",
                                            boxShadow: "none"
                                        }
                                    }}>
                                    {searchOptions
                                        ? <ListSubheader className="p-0 bgs-search-select" disableGutters sx={{ backgroundColor: "transparent" }}>
                                            <TextField
                                                autoFocus
                                                fullWidth
                                                inputProps={{
                                                    ref: refInput,
                                                }}
                                                label={<BgsLabel label={label} showIcon={showIcon} validation={validation} editorType={editorType} />}
                                                size="small"
                                                sx={{ backgroundColor: "#fff" }}
                                                variant={apperance}
                                                onChange={(event: any) => {
                                                    clearTimeout(timer)
                                                    timer = setTimeout(() => { setIsNew(true), setSearch(event.target.value), setPageState(1) }, 800);
                                                    event.preventDefault()
                                                }}
                                                // onBlur={() => setTimeout(() => { setIsNew(true), setSearch(null) }, 1000)}
                                                onKeyDown={e => {
                                                    if (e.keyCode === 27) popupState.close();
                                                    e.stopPropagation()
                                                }}
                                                placeholder={`Search ${label?.text}`}
                                                InputProps={{
                                                    className: `${editorOptions?.className}`,
                                                    startAdornment: <>
                                                        {prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : null}
                                                    </>,
                                                    endAdornment: loading ? <BgsSpinner /> : (!statusState ? <InputAdornment position="end"><Tooltip title={messageError}><ErrorOutlineIcon color="error" /></Tooltip></InputAdornment> : <InputAdornment position="end"><SearchIcon /></InputAdornment>),
                                                }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </ListSubheader>
                                        : null}
                                    {(allowSelectAll && multiple) && <Paper
                                        className="shadow"
                                        style={{
                                            width: widthOptions || width,
                                            overflowY: "auto",
                                            overflowX: "hidden",
                                            paddingTop: 0,
                                            borderRadius: "6px 6px 0px 0px",
                                            borderBottom: "1px solid #eee"
                                        }}>
                                        <ListItem
                                            disablePadding={true}
                                            tabIndex={0}
                                            className={isArray(value, 0) ? (value.length === totalRecordState ? "selected-item" : "") : ""}
                                            selected={isArray(value, 0) ? (value.length === totalRecordState) : false}
                                            onKeyDown={(e) => {
                                                if (e.keyCode === 13) {
                                                    selectAll(value)
                                                    e.preventDefault()
                                                }
                                            }}
                                            onClick={() => {
                                                selectAll(value)
                                                onBlur()
                                            }}>
                                            <ListItemButton>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={isArray(value, 0) ? (value.length === totalRecordState) : false}
                                                        indeterminate={isArray(value, 0) ? (value.length !== totalRecordState) : false}
                                                        tabIndex={-1}
                                                        disableRipple
                                                        inputProps={{ "aria-labelledby": "select-all" }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText title="Select All" primaryTypographyProps={{
                                                    style: {
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: width - 30
                                                    }
                                                }} id="select-all" primary="Select All" />
                                            </ListItemButton>
                                        </ListItem>
                                    </Paper>}
                                    <Paper
                                        style={{
                                            width: widthOptions || width,
                                            maxHeight: allowSelectAll ? (window.innerHeight / 300) * 100 - 46.26 : (window.innerHeight / 300) * 100,
                                            overflowY: "auto",
                                            overflowX: "hidden",
                                            paddingTop: 0,
                                            ...!allowSelectAll && {
                                                boxShadow: "0px 0px 12px 1px rgb(0 0 0 / 36%)"
                                            },
                                            ...multiple && {
                                                borderRadius: allowSelectAll ? "0px" : "6px 6px 0px 0px"
                                            }
                                        }}
                                        onScroll={(event: React.SyntheticEvent) => {
                                            const listboxNode = event.currentTarget;
                                            if ((!loading && (dataSourceState.length < totalRecordState)) && listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) {
                                                setPageState(pageState + 1);
                                            }
                                        }}
                                    >
                                        {!dataSourceState.length ? <Box className="MuiDataGrid-overlay d-flex align-items-center justify-content-center flex-column w-100 hg-150">
                                            <svg width="100" height="50" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                                                <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                                    <ellipse fill="#F5F5F5" cx="32" cy="33" rx="32" ry="7"></ellipse>
                                                    <g fillRule="nonzero" stroke="#D9D9D9">
                                                        <path
                                                            d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z">
                                                        </path>
                                                        <path
                                                            d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                                                            fill="#FAFAFA"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                            <Box sx={{ color: "#D9D9D9" }}>No Data</Box>
                                        </Box> : null}
                                        {dataSourceState.map(({ displayExpr, valueExpr, data }, index) => {
                                            const labelId = `checkbox-list-label-${valueExpr}`;

                                            const selected = ({ valueExpr, displayExpr, data, popupState }: { valueExpr: string, displayExpr: string, data: any, popupState?: any }) => {
                                                if (!valueExpr || dataDisabledSelected.includes(valueExpr)) return;
                                                let selectedData: DataSourceModel[] = !multiple ? [{
                                                    valueExpr,
                                                    displayExpr,
                                                    data
                                                }] : (dataSelected.find(x => x.valueExpr === valueExpr) ? dataSelected.filter(x => x.valueExpr !== valueExpr) : [...dataSelected, {
                                                    valueExpr,
                                                    displayExpr,
                                                    data
                                                }])

                                                setValue(dataField, !multiple ? (valueExpr || null) : (selectedData.length ? selectedData.map(x => x.valueExpr) : null));

                                                setDataSelected(selectedData);

                                                if (!multiple && popupState) popupState?.close();

                                                if (search && !multiple) {
                                                    setIsNew(true)
                                                    setSearch(null)
                                                }

                                                onChangeOptions({
                                                    value: !multiple ? valueExpr : selectedData.map(x => x.valueExpr),
                                                    data: !multiple ? data : selectedData.map(x => x.data),
                                                    formRef
                                                })

                                                setOptionSelectedValue(!multiple ? {
                                                    valueExpr,
                                                    displayExpr,
                                                    data
                                                } : selectedData)

                                                if (afterChange?.clearItems?.length) formRef.reset(afterChange?.clearItems);
                                                if (afterChange?.reloadItems?.length) afterChange?.reloadItems.forEach(field => formRef.itemOption(field).option("key", v4()));
                                            }

                                            return (
                                                <ListItem
                                                    key={index}
                                                    disablePadding={true}
                                                    tabIndex={0}
                                                    className={!multiple ? (value === valueExpr ? "selected-item" : "") : (isArray(value, 0) ? (value.includes(valueExpr) ? "selected-item" : "") : "")}
                                                    // selected={value === valueExpr}
                                                    disabled={!valueExpr || dataDisabledSelected.includes(valueExpr)}
                                                    onKeyDown={(e) => {
                                                        if (e.keyCode === 13) {
                                                            selected({ valueExpr, displayExpr, data, popupState })
                                                            e.preventDefault()
                                                        }
                                                    }}
                                                    onClick={() => {
                                                        selected({ valueExpr, displayExpr, data, popupState })
                                                        onBlur()
                                                    }}>
                                                    {renderOption
                                                        ? renderOption({ valueExpr, displayExpr, data })
                                                        : <ListItemButton>
                                                            {multiple && <ListItemIcon sx={{ minWidth: 36 }}>
                                                                <Checkbox
                                                                    edge="start"
                                                                    checked={value && value?.includes(valueExpr)}
                                                                    tabIndex={-1}
                                                                    disabled={!valueExpr || dataDisabledSelected.includes(valueExpr)}
                                                                    disableRipple
                                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                                />
                                                            </ListItemIcon>}
                                                            <ListItemText title={displayExpr} primaryTypographyProps={{
                                                                style: {
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    maxWidth: width - 30
                                                                }
                                                            }} id={labelId} primary={displayExpr} />
                                                        </ListItemButton>}
                                                </ListItem>
                                            );
                                        })}
                                    </Paper>
                                    {multiple && <div className="p-2 bg-white d-flex justify-content-between" style={{ boxShadow: "rgb(0 0 0 / 36%) -2px 9px 9px 0px", borderTop: "1px solid #e6e6e6", borderRadius: "0px 0px 6px 6px" }}>
                                        <div>
                                            <BgsButton onClick={() => {
                                                popupState.close()
                                                setIsNew(true)
                                                setSearch(null)
                                            }} className="hg-22 wd-36">Ok</BgsButton>
                                            {/* {dataSelected.length > 0 && <BgsButton onClick={() => {
                                                bgsModal({
                                                    width: 400,
                                                    render: e => <ModalListSelected modalOptions={e} selected={selected} onBlur={onBlur} dataSelected={dataSelected} />
                                                })
                                            }} variant="text" className="hg-22 wd-36">Show data selected</BgsButton>} */}
                                        </div>
                                        <span className="fs-13 text-secondary" title={dataSelected.map(x => x.displayExpr).join(", ")}>Total selected items {dataSelected.length}</span>
                                    </div>}
                                </Menu>
                            </React.Fragment>
                        )}
                    </PopupState>
                </div>
            )}
        />
    </div >
})

export default BgsSelect;