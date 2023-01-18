import { Columns, FormGroupModel, FormModel, FormRef, ResponseModel, TableRef } from "../models/models";
import SearchIcon from '@mui/icons-material/Search';
import BgsGroupForm from "../form/group";
import BgsComponentForm from "../form/component";
import { ModalFunc } from "../modal/modal";
import { Children, useEffect, useRef, useState } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import { getFieldValue, isArray } from "../lib";
import { Alert, Badge, Box, Divider, Menu, MenuItem, Tooltip } from "@mui/material";
import BgsSpinner from "../form/spinner";
import { Highlighted } from "./table";
import BgsButton from "../form/button";
import { FilteringOptions } from "../models/table.model";
import RequestModel from "../models/request.model";
import React from 'react'
import BgsForm from "../form/form";
import moment from "moment";

interface FilterRangeModalProps {
    column: Columns;
    hide: Function;
    helper?: (data: any) => any;
    parameter?: (tableRef: TableRef) => RequestModel;
    limitState: number;
    pageState: number;
    criteriaState: any;
    filterState: any;
    betweenState: any;
    betweenDuplicateState: any;
    tableRef: TableRef;
    onSubmit: (value: any, option: any) => any;
    criteriaTypeState: "OR" | "AND";
}

type FilterRange = "equals" | "greaterThanEqualTo" | "lessThanEqualTo" | "between";

interface TypeFilterBetweenProps {
    type: FilterRange;
    icon: string;
    label: string;
}

export default function FilterRangeModal({ column, betweenState, betweenDuplicateState, tableRef, hide, onSubmit }: FilterRangeModalProps) {
    const field: any = column.dataField;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const formRef = useRef<FormRef>(null);

    const typeFilterBetweenList: TypeFilterBetweenProps[] = [{
        type: "equals",
        icon: "equal",
        label: "Equals"
    }/**, {
        type: "lessThan",
        icon: "less",
        label: "Less than"
    }, {
        type: "greaterThan",
        icon: "greater",
        label: "Greater than"
    } */, {
        type: "lessThanEqualTo",
        icon: "lessorequal",
        label: "Less than or equal to"
    }, {
        type: "greaterThanEqualTo",
        icon: "greaterorequal",
        label: "Greater than or equal to"
    }, {
        type: "between",
        icon: "range",
        label: "Between"
    }]

    const defaultTypeFilter = (): TypeFilterBetweenProps => {
        // let result: FilterRange = "equals"
        // if (betweenState[field]) {
        //     const { from, to } = betweenState[field] || {};

        //     if (from && !to) result = "greaterThan"
        //     else if (!from && to) result = "lessThan"
        //     else if (from && to) {
        //         const startDate = moment(moment(from).format("YYYY-MM-DD"));
        //         const endDate = moment(moment(to).format("YYYY-MM-DD"));
        //         if (endDate.diff(startDate, "days") > 1) result = "between"
        //     }
        // }
        // const find = typeFilterBetweenList.find(x => x.type === result) || typeFilterBetweenList[0];
        return betweenDuplicateState[field] || typeFilterBetweenList[0];
    }

    useEffect(() => {
        const filter = defaultTypeFilter();
        let { from: startDate, to: endDate } = betweenState[field] || {}
        if (typeFilterBetween.type === "lessThanEqualTo" && endDate) startDate = moment(endDate).format(formatValue), endDate = null;
        else if (typeFilterBetween.type === "greaterThanEqualTo" && startDate) startDate = moment(startDate).format(formatValue), endDate = null;
        // else if (typeFilterBetween.type === "between" && startDate) setTimeout(() => formRef.current?.itemOption("endDate").option("editorOptions.minDate", moment(startDate)), 100)

        formRef.current?.updateData({
            startDate,
            endDate
        })
        setTimeout(() => endDateVisible(filter), 100)
    }, [betweenState])

    const [typeFilterBetween, setTypeFilterBetween] = useState<TypeFilterBetweenProps>(defaultTypeFilter())

    const reset = () => {
        onSubmit(null, null)
        hide();
    }

    const endDateVisible = (prop: TypeFilterBetweenProps) => {
        const { startDate } = formRef.current?.getData()

        if (prop.type === "between" && startDate) formRef.current?.itemOption("endDate").option("editorOptions.minDate", moment(startDate))

        formRef.current?.itemOption("endDate").option("visible", prop.type === "between")
        formRef.current?.itemOption("startDate").option("label.text", prop.type === "between" ? `Start Date (${column.caption})` : column.caption)
        setAnchorEl(null)
        setTypeFilterBetween(prop)
    }

    const formatValueDesc = () => {
        let result = "YYYY-MM-DD";
        switch (column.dataType) {
            case "date":
                result = "YYYY-MM-DD"
                break;
            case "datetime":
                result = "YYYY-MM-DD HH:mm:ss"
                break;
            case "time":
                result = "HH:mm:ss"
                break;
            default:
                break;
        }

        return result;
    }

    const formatValue = formatValueDesc();

    const form: FormGroupModel = {
        onSubmit: ({ startDate: from = null, endDate: to = null }) => {

            if (typeFilterBetween.type === "equals") to = moment(from).add(1, column.dataType === "time" ? "hours" : "days").format(formatValue)
            else if (typeFilterBetween.type === "lessThanEqualTo" && from) to = moment(from).format(formatValue), from = null;
            else if (typeFilterBetween.type === "greaterThanEqualTo" && from) from = moment(from).format(formatValue), to = null;

            onSubmit({
                ...from ? { from: moment(from).format(formatValue) } : null,
                ...to ? { to: moment(to).format(formatValue) } : null
            }, typeFilterBetween)
        },
        item: {
            date: {
                items: [{
                    dataField: "startDate",
                    label: {
                        text: `${column.caption}`
                    },
                    editorOptions: {
                        mode: column.dataType as any,
                        className: "w-100 no-label-input",
                        format: {
                            value: formatValue
                        },
                        allowClear: true,
                        onChange: ({ value }) => {
                            formRef.current?.itemOption("endDate").option("editorOptions.minDate", moment(value))
                            const { endDate } = formRef.current?.getData();
                            if (Number(moment(endDate).format("YYYYMMDDHHmmss")) > Number(moment(value).format("YYYYMMDDHHmmss"))) formRef.current?.reset("endDate")
                        }
                    },
                    editorType: "date",
                    validationRules: ["required"]
                }, {
                    visible: false,
                    dataField: "endDate",
                    label: {
                        text: `End Date (${column.caption})`
                    },
                    editorOptions: {
                        format: {
                            value: formatValue
                        },
                        mode: column.dataType as any,
                        className: "w-100 no-label-input",
                        allowClear: true
                    },
                    editorType: "date",
                    validationRules: ["required"]
                }]
            }
        }
    }

    return <BgsGroupForm
        {...form}
        ref={formRef}
        className="no-label-floating p-3"
        render={group => <>
            <div className="wt-330">
                <div className="d-flex align-items-start justify-content-between">
                    <div className="w-100 me-2 ">
                        <BgsForm name="date" {...group} />
                    </div>
                    <BgsButton variant="icon" className="mgt-3" title={typeFilterBetween.label} onClick={({ event }) => setAnchorEl(event.currentTarget)}>
                        <i className={`dx-icon-${typeFilterBetween.icon} fs-20`} />
                    </BgsButton>
                </div>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                >
                    {Children.toArray(typeFilterBetweenList.map(prop => <MenuItem
                        className="text-secondary"
                        onClick={() => endDateVisible(prop)}
                    >
                        <i className={`dx-icon-${prop.icon} fs-20 me-3`} /> {prop.label}
                    </MenuItem>))}
                </Menu>
                <Divider className="mt-3 mb-3" />
                <div className={`d-flex align-items-center justify-content-${!!betweenState[field] ? "between" : "end"} w-100`}>
                    {!!betweenState[field] && <div className="d-flex align-items-center justify-content-start">
                        <BgsButton className="me-2 hg-34 wt-90" variant="text" onClick={reset}>Reset</BgsButton>
                    </div>}
                    <div>
                        <BgsButton className="me-2 hg-34 wt-90" variant="outlined" onClick={() => hide()}>Cancel</BgsButton>
                        <BgsButton className="hg-34 wt-110" type="submit">Apply Filter</BgsButton>
                    </div>
                </div>
            </div>
        </>}
    />
}