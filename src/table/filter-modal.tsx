import { Columns, FormGroupModel, ResponseModel, TableRef } from "../models/models";
import SearchIcon from '@mui/icons-material/Search';
import BgsGroupForm from "../form/group";
import BgsComponentForm from "../form/component";
import { ModalFunc } from "../modal/modal";
import { useEffect, useState } from "react";
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

interface FilterModalProps {
    column: Columns;
    hide: Function;
    helper?: (data: any) => any;
    parameter?: (tableRef: TableRef) => RequestModel;
    limitState: number;
    pageState: number;
    criteriaState: any;
    filterState: any;
    tableRef: TableRef;
    onSubmit: (value: any) => any;
    criteriaTypeState: "OR" | "AND";
}

export default function FilterModal({ column, helper, parameter, tableRef, hide, onSubmit, criteriaState, filterState = {}, criteriaTypeState }: FilterModalProps) {
    const field: any = column.dataField;
    const filterOptions: FilteringOptions = typeof column.allowFiltering === "boolean" ? {} : column.allowFiltering as any;
    const [dataSourceState, setDataSourceState] = useState<any>([]);
    const [dataFilter, setDataFilter] = useState<string[]>(filterState[field] || []);
    const [search, setSearch] = useState<string>("");
    const [sort, setSort] = useState<string>("asc");
    const [loadingState, setLoadingState] = useState<boolean>(false);
    const [totalRecordState, setTotalRecordState] = useState<number>(-1);
    const [limitState, setLimitState] = useState<number>(10);
    const [statusState, setStatusState] = useState<boolean>(true);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [messageError, setMessageError] = useState<string>("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    let timer: any = null;
    const [optSearch, setOptSearch] = useState<"criteria" | "filter">("criteria")

    const formFilter: FormGroupModel = {
        item: {
            search: {
                dataField: `Search ${column.caption}`,
                editorOptions: {
                    allowClear: true,
                    ...(typeof filterOptions.allowOptionSearching === "undefined" ? true : filterOptions.allowOptionSearching) && {
                        suffix: <BgsButton title={optSearch === "criteria" ? "Contains" : "Equals"} variant="icon" className="mgr-3" onClick={({ event }) => setAnchorEl(event.currentTarget)}>
                            <i className={`dx-icon-${optSearch === "criteria" ? "contains" : "equal"} fs-20`} />
                        </BgsButton>
                    },
                    placeholder: `Search ${column.caption}`,
                    className: "bg-white no-label-input",
                    onChange: ({ value }) => {
                        clearTimeout(timer)
                        timer = setTimeout(() => { setSearch(value), setLimitState(10) }, 800);
                    }
                }
            }
        }
    }

    const refresh = async () => {
        if (filterOptions.helper) {
            let reqBody: any = {
                parameter: {
                    criteria: {},
                    filter: {},
                    sort: {
                    },
                    ...parameter && parameter(tableRef)?.parameter
                },
                paging: {

                }
            };

            reqBody.parameter.sort[filterOptions.sortBy || field] = sort;

            if (filterOptions.searchBy && search) {
                if (typeof filterOptions.searchBy === "string") reqBody.parameter[optSearch][filterOptions.searchBy] = optSearch === "criteria" ? `${search}` : [search]
                else if (typeof filterOptions.searchBy === "object") {
                    if (isArray(filterOptions.searchBy, 0)) filterOptions.searchBy.forEach((key: string) => {
                        reqBody.parameter[optSearch][key] = optSearch === "criteria" ? `${search}` : [search]
                    })
                }
            }
            else if (!filterOptions.searchBy && search) reqBody.parameter[optSearch][field] = optSearch === "criteria" ? `${search}` : [search]

            reqBody.paging = {
                limit: limitState,
                page: 1
            }

            const { status, data, paging, message, description }: ResponseModel = await filterOptions.helper(reqBody)
            const { totalrecord = 0 } = paging || {};

            setLoadingState(false)
            setTotalRecordState(totalrecord)
            setStatusState(status)
            setMessageError(status ? "" : (message || description))
            setDataSourceState(status && isArray(data, 0) ? data.map(remapDataSource) : [])
            if (selectAll) setDataFilter(status && isArray(data, 0) ? data.map(remapDataSource).map((x: any) => x.valueExpr) : [])

        }
        else if (filterOptions.dataSource) {
            setDataSourceState(isArray(filterOptions.dataSource, 0) ? filterOptions.dataSource.map(remapDataSource) : [])
            setTotalRecordState(filterOptions.dataSource.length)
            if (selectAll) setDataFilter(isArray(filterOptions.dataSource, 0) ? filterOptions.dataSource.map(remapDataSource).map((x: any) => x.valueExpr) : [])
        }
        else if (helper) {
            setLoadingState(true)
            let filterModal: any = {};
            const filterKeys = Object.keys(filterState);
            const findIndexKeys = filterKeys.findIndex(x => x === field)
            filterKeys.forEach((item, index) => {
                if (index < findIndexKeys || findIndexKeys === -1) {
                    filterModal[item] = filterState[item];
                }
            });

            let opt: any = {
                filter: {},
                criteria: {}
            }

            if (search) {
                opt[optSearch][field] = optSearch === "criteria" ? `${search}` : [search]
            }

            let reqBody = {
                parameter: {
                    sort: {
                        [field]: sort
                    },
                    criteria: {
                        ...criteriaState,
                        ...opt.criteria
                    },
                    filter: {
                        ...filterModal,
                        ...opt.filter
                    },
                    criteriaType: criteriaTypeState,
                    columns: [field],
                    isDistinct: true
                },
                paging: {
                    limit: limitState,
                    page: 1
                }
            };

            const { status, data, paging, message, description }: ResponseModel = await helper(reqBody)
            const { totalrecord = 0 } = paging || {};

            setLoadingState(false)
            setTotalRecordState(totalrecord)
            setStatusState(status)
            setMessageError(status ? "" : (message || description))
            setDataSourceState(status && isArray(data, 0) ? data : [])
            if (selectAll) setDataFilter(status && isArray(data, 0) ? data.map((x: any) => getFieldValue(x, field)) : [])
        }
    }

    useEffect(() => {
        refresh()
        tableRef.searchText = search
    }, [search, limitState, selectAll, sort])

    useEffect(() => {
        if (selectAll) setLimitState(totalRecordState)
    }, [selectAll])

    useEffect(() => {
        if (search) refresh()
    }, [optSearch])

    const reset = () => {
        setDataFilter([]);
        onSubmit([])
        hide();
    }

    const handleToggle = (value: any) => () => {
        const currentIndex = dataFilter.indexOf(value);
        const newChecked: string[] = [...dataFilter];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setDataFilter(newChecked);
    };

    const submit = () => {
        onSubmit(dataFilter)
    }

    const selectAllData = (value: boolean) => {
        setSelectAll(value)
        if (!value) setDataFilter([])
    }

    const remapDataSource = (d: any, i: any) => {
        const {
            displayExpr,
            valueExpr
        } = filterOptions || {};

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

    return <div className="wt-320 bgs-filter-table">
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
        >
            <MenuItem
                className="text-secondary"
                selected={optSearch === "criteria"}
                onClick={() => {
                    setAnchorEl(null)
                    setOptSearch("criteria")
                }}
            >
                <i className="dx-icon-contains fs-20 me-3" /> Contains
            </MenuItem>
            <MenuItem
                className="text-secondary"
                selected={optSearch === "filter"}
                onClick={() => {
                    setAnchorEl(null)
                    setOptSearch("filter")
                }}
            >
                <i className="dx-icon-equal fs-20 me-3" /> Equals
            </MenuItem>
        </Menu>
        <div className="p-3">
            <div className="d-flex align-items-center justify-content-between bgs-filter-table-header">
                {(typeof filterOptions.allowSearching === "undefined" ? true : filterOptions.allowSearching) && <BgsGroupForm
                    {...formFilter}
                    className="no-label-floating w-100"
                    render={group => <BgsComponentForm name="search" {...group} />}
                />}
                {(typeof filterOptions.allowSorting === "undefined" ? true : filterOptions.allowSorting) && <BgsButton title={`sort to ${sort === "asc" ? "desc" : "asc"} bgs-filter-table-btn-sort`} variant="icon" className="wt-35 ms-1" onClick={() => setSort(sort === "asc" ? "desc" : "asc")}><i className={`dx-icon-${sort === "asc" ? "sortuptext" : "sortdowntext"} fs-20`}></i></BgsButton>}
            </div>
            <Box className="bgs-filter-table-content">
                <ListItem disablePadding className="mt-2">
                    <ListItemButton role={undefined} dense disabled={!dataSourceState.length} onClick={e => selectAllData(!selectAll)}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox
                                edge="start"
                                checked={dataSourceState.length ? (dataFilter.length === totalRecordState) : !!dataSourceState.length}
                                indeterminate={dataSourceState.length ? (dataFilter.length === totalRecordState ? false : !!dataFilter.length) : !!dataSourceState.length}
                                tabIndex={-1}
                                disabled={!dataSourceState.length}
                                disableRipple
                                inputProps={{ 'aria-labelledby': "select-all" }}
                            />
                        </ListItemIcon>
                        <ListItemText id="select-all">
                            <div className="d-flex align-items-center justify-content-between">
                                <span>{dataSourceState.length ? (dataFilter.length === totalRecordState ? "Unselect All" : "Select All") : "Select All"} <b>({totalRecordState})</b></span>
                                <Tooltip title={dataFilter.join(", ")} disableHoverListener={dataFilter.length ? false : true}>
                                    <Badge color="primary" badgeContent={dataFilter.length}>
                                        <div></div>
                                    </Badge>
                                </Tooltip>
                            </div>
                        </ListItemText>
                    </ListItemButton>
                </ListItem>
                <Divider />
                <div className="scroll loading-table max-hg-190 min-hg-190 p-2 pe-0 ps-0 pdt-0 position-relative bgs-filter-table-footer" style={{ overflowY: "scroll" }}>
                    <div className="w-100">
                        {dataSourceState.map((data: any, index: number) => {
                            const labelId = `checkbox-list-label-${index}`;
                            return (
                                <ListItem key={index} disablePadding>
                                    <ListItemButton role={undefined} dense onClick={handleToggle(helper && !filterOptions.dataSource && !filterOptions.helper ? getFieldValue(data, field) : data.valueExpr)}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={dataFilter.indexOf(helper && !filterOptions.dataSource && !filterOptions.helper ? getFieldValue(data, field) : data.valueExpr) !== -1}
                                                tabIndex={-1}
                                                disableRipple
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText id={labelId}>
                                            <div>
                                                {
                                                    typeof column.template === "function" && helper && !filterOptions.dataSource && !filterOptions.helper
                                                        ? column.template(data, index, column, { ...tableRef, searchText: search })
                                                        : <Highlighted
                                                            text={data.displayExpr}
                                                            highlight={search}
                                                        />
                                                }
                                            </div>
                                        </ListItemText>
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </div>
                    {loadingState && <div className="border shadow loading-container">
                        <BgsSpinner size={35} className="loading-content mb-2" />
                        Loading...
                    </div>}
                    <div className="d-flex align-items-center justify-content-center">
                        {((dataSourceState.length !== totalRecordState) && dataSourceState.length) && <BgsButton loading={loadingState} variant="outlined" className="hg-26" onClick={() => setLimitState(limitState + 10)}>loadmore...</BgsButton>}
                    </div>
                    {!dataSourceState.length && <div style={{ position: "sticky", left: 0 }}>
                        <Box className="MuiDataGrid-overlay d-flex align-items-center justify-content-center flex-column w-100 position-relative">
                            {!statusState ? <Alert onClose={() => setStatusState(true)} className="w-100" sx={{ position: "absolute", top: 0 }} severity="error">{messageError}</Alert> : null}
                            <div className="p-5 d-flex align-items-center justify-content-center flex-column w-100">
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
                            </div>
                        </Box>
                    </div>}
                </div>
            </Box>
        </div>
        <Divider />
        <div className="d-flex align-items-center justify-content-end p-3 pdt-15 pdb-15 bgs-filter-table-footer">
            {(filterState[field] ? (filterState[field].length > 0) : false) && <div className="d-flex align-items-center justify-content-start">
                <BgsButton className="me-2 hg-34 wt-90 bgs-filter-table-btn-reset" variant="text" onClick={reset}>Reset</BgsButton>
            </div>}
            <BgsButton className="me-2 hg-34 wt-90 bgs-filter-table-btn-cancel" variant="outlined" onClick={() => hide()}>Cancel</BgsButton>
            <BgsButton className="hg-34 wt-110 bgs-filter-table-btn-yes" onClick={submit}>Apply Filter</BgsButton>
        </div>
    </div>
}