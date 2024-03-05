import { PropsForm } from "../models/form.model";
import { Controller } from "react-hook-form";
import { v4 } from "uuid";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { useEffect, useState } from "react";
import { recursiveReMapping, getFieldValue, isArray, jsonCopy, validationRules } from "../lib";
import { ResponseModel } from "../models/models";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from '@mui/material/Radio';
import FormLabel from "@mui/material/FormLabel";
import React, { useImperativeHandle, forwardRef } from "react";
import { BgsLabel } from "./input";

interface DataSourceModel {
    displayExpr: string;
    valueExpr: string;
    data: any;
}

const BgsRadioButton = forwardRef(({
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
    const { disabled, readOnly, visible = visibleItem, onChange: onChangeOptions = () => { } } = editorOptions || {};
    const { control, getValues, watch } = formControl;
    const defaultValue = getValues(dataField);

    const [dataSourceState, setDataSourceState] = useState<DataSourceModel[]>([]);
    const [pageState, setPageState] = useState<number>(1);
    const [limitState, setLimitState] = useState<number>(50);
    const [totalRecordState, setTotalRecordState] = useState<number>(0);
    // @ts-ignore
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const {
            mode = "default",
            isFirstLoad = true
        } = editorOptions || {};

        if (mode === "default") {
            if (isFirstLoad) refresh()
        }

    }, [pageState, limitState])

    useEffect(() => {
        checkIsExist();
    }, [dataSourceState, watch(dataField)])

    const refresh = async () => {
        const {
            helper,
            dataSource = [],
            parameter
        } = editorOptions || {};

        setLoading(true)

        if (helper) {
            const param: any = parameter ? (parameter(formRef) || {}) : {};

            const { status, data, paging }: ResponseModel = await helper({
                parameter: {
                    column: [],
                    ...param
                },
                paging: {
                    limit: limitState,
                    page: pageState
                }
            })
            const { totalrecord = 0 } = paging || {};
            setTotalRecordState(totalrecord)
            const dataSrc = status && isArray(data, 0) ? data.map(remapDataSource) : [];
            setDataSourceState([...dataSourceState, ...dataSrc])
            setLoading(false)
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

        if (typeof (d) === "string") return {
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

    const checkIsExist = () => {
        if (defaultValue) if (!dataSourceState.find(x => x.valueExpr === defaultValue) && dataSourceState.length < totalRecordState) {
            setLimitState(totalRecordState);
            setPageState(1);
        }
    }

    return <div className="bgs-radiobutton w-100">
        <Controller
            name={dataField}
            control={control}
            rules={!visible || disabled || readOnly ? {} : validationRules(validation, item, formControl, formRef)}
            render={({
                field: { onChange, onBlur, value = "" },
                fieldState: { invalid, error },
            }) => (
                <FormControl component="fieldset" error={invalid} disabled={disabled || readOnly}>
                    {labelVisible ?
                        <FormLabel component="legend"><BgsLabel label={label} showIcon={showIcon} validation={validation} editorType={editorType} editorOptions={editorOptions} formControl={formControl} dataField={dataField}/></FormLabel>
                        : null}
                    <RadioGroup
                        aria-label={dataField}
                        value={value}
                        onChange={(e) => {
                            onChange(e)
                            const { data = null } = e.target.value ? (dataSourceState.find(x => x.valueExpr === e.target.value) || {}) : {}
                            onChangeOptions({
                                value: e.target.value,
                                data,
                                formRef
                            })
                        }}
                        onBlur={onBlur}
                        row={!(editorOptions?.aligned === "vertical")}
                    >
                        {dataSourceState.map(({ valueExpr, displayExpr }, index) => <FormControlLabel
                            key={index}
                            value={valueExpr}
                            control={<Radio sx={{
                                '& .MuiSvgIcon-root': {
                                    fontSize: 24,
                                },
                            }}
                            />}
                            label={displayExpr}
                        />)}
                    </RadioGroup>
                    <FormHelperText>{error?.message || label?.hint}</FormHelperText>
                </FormControl>
            )}
        />
    </div >

})

export default BgsRadioButton;