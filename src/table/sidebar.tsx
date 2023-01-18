import { Children, useEffect, useRef, useState } from "react";
import BgsButton from "../form/button";
import BgsTypography from "../typography/typography";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import { BgsTableSidebarProps, Columns } from "../models/table.model";
import FormModel, { FormRef } from "../models/form.model";
import BgsForm from "../form/form";
import SearchIcon from '@mui/icons-material/Search';
import { getFieldValue, isArray } from "../lib";
import TextField from "@mui/material/TextField";
import FilterModal from "./filter-modal";
import Menu from "@mui/material/Menu";
import { Badge, InputAdornment } from "@mui/material";
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import React from "react"
import FilterRangeModal from "./range-modal";
import moment from "moment";

const BgsTableSidebar = ({
    limitState,
    columnSearch,
    setCriteriaState,
    criteriaState,
    criteriaTypeState,
    setCriteriaTypeState,
    helper,
    parameter,
    columnsState,
    setFilterState,
    filterState,
    pageState,
    tableRef,
    betweenState,
    setBetweenState,
    betweenDuplicateState,
    setBetweenDuplicateState,
}: BgsTableSidebarProps) => {
    const [searchShow, setSearchShow] = useState<boolean>(true);

    useEffect(() => {
        setTimeout(() => {
            let resetFields: string[] = columnSearch.map(x => x.dataField);
            Object.keys(criteriaState).forEach(field => {
                if (criteriaState[field]) resetFields = resetFields.filter(x => x !== field)
            })
            formSearchRef.current?.updateData(criteriaState)
            formSearchRef.current?.reset(resetFields)
        }, 200)
    }, [criteriaState])

    useEffect(() => {
        formCriteriaRef.current?.updateData({ criteriaType: criteriaTypeState })
    }, [criteriaTypeState])

    let timer: any = {};
    const formSearchRef = useRef<FormRef>(null);
    const formCriteriaRef = useRef<FormRef>(null);

    const formCriteria: FormModel = {
        items: [{
            dataField: "criteriaType",
            editorType: "select",
            label: {
                text: "Search Type"
            },
            editorOptions: {
                onChange: ({ value }) => setCriteriaTypeState(value),
                dataSource: [{
                    text: "or",
                    value: "OR"
                }, {
                    text: "and",
                    value: "AND"
                }],
                size: "small",
                displayExpr: "text",
                valueExpr: "value",
                className: "bg-white hg-20 min-hg-20 wt-90 max-hg-20 no-label-input"
            }
        }]
    }

    const formSearch: FormModel = {
        items: columnSearch.map(({ dataField, caption }) => ({
            dataField,
            label: {
                text: `${caption}`
            },
            editorOptions: {
                allowClear: true,
                onChange({ formRef }) {
                    clearTimeout(timer[dataField])
                    timer[dataField] = setTimeout(() => {
                        const data = formRef.getData();
                        let criteria: any = {}
                        columnSearch.forEach(({ dataField }) => {
                            if (getFieldValue(data, dataField)) {
                                criteria[dataField] = getFieldValue(data, dataField)
                            }
                        })
                        setCriteriaState(criteria)
                    }, 500);
                },
                placeholder: `${caption}`,
                prefix: <SearchIcon className="ms-2" />,
                className: "bg-white no-label-input mgb-5"
            }
        }))
    }

    const [itemsFilter] = useState<Columns[]>(columnsState.filter(x => x.allowFiltering));

    // useEffect(() => {
    //     let result: Columns[] = [];
    //     let columnFilter: Columns[] = columnsState.filter(x => x.allowFiltering);

    //     Object.keys(filterState).forEach((field) => {
    //         const find = columnFilter.find(x => x.dataField === field);
    //         if (find) result.push(find), columnFilter = columnFilter.filter(x => x.dataField !== field)
    //     })
    //     setItemsFilter([...result, ...columnFilter])
    // }, [])

    // const onDragEnd = ({ destination, source }: DropResult) => {
    //     if (!destination) return;

    //     const newItems = reorder(itemsFilter, source.index, destination.index);

    //     setItemsFilter(newItems);
    // };

    useEffect(() => {
        let columnFilter: string[] = Object.keys(filterState);
        if (!columnFilter.length) return;

        let ordering: string[] = [];

        itemsFilter.forEach(({ dataField }) => {
            const find = columnFilter.find(x => x === dataField);
            if (find) ordering.push(find), columnFilter = columnFilter.filter(x => x !== dataField)
        })

        if (ordering.length) {
            let result: any = {};
            ordering.forEach(field => (result[field] = getFieldValue(filterState, field)))
            setFilterState(result)
        }

    }, [itemsFilter])

    const returnValue = (item: Columns, filterState: any, betweenState: any, isTotal: boolean = false) => {
        const { dataField, dataType } = item;

        if (dataType === "date" || dataType === "datetime" || dataType === "time") {
            let { from: startDate = "", to: endDate = "" } = betweenState[dataField as any] || {};
            const typeFilterBetween = betweenDuplicateState[dataField as any] || {};

            const formatValueDesc = () => {
                let result = "YYYY-MM-DD";
                switch (dataType) {
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
            const formatValueDisplay = () => {
                let result = "DD MMM YYYY";
                switch (dataType) {
                    case "date":
                        result = "DD MMM YYYY"
                        break;
                    case "datetime":
                        result = "DD MMM YYYY HH:mm:ss"
                        break;
                    case "time":
                        result = "HH:mm:ss"
                        break;
                    default:
                        break;
                }

                return result;
            }
            
            if (typeFilterBetween.type === "lessThanEqualTo" && endDate) startDate = moment(endDate).format(formatValueDisplay()), endDate = "";
            else if (typeFilterBetween.type === "greaterThanEqualTo" && startDate) startDate = moment(startDate).format(formatValueDisplay()), endDate = "";
            else {
                if(startDate) startDate = moment(startDate, formatValueDesc()).format(formatValueDisplay())
                if(endDate) endDate = moment(endDate, formatValueDesc()).format(formatValueDisplay())
            }

            return isTotal ? null : `${startDate}${startDate && endDate ? " - " : ""}${endDate}`
        }
        else {
            const data = filterState[dataField as any];
            if (isArray(data, 0)) return isTotal ? (data.length || null) : data?.join(", ");

            const result = getFieldValue(filterState, dataField)

            if (isArray(result, 0)) return isTotal ? (result.length || null) : result?.join(", ")

            return isTotal ? null : ""
        }
    }

    interface AnchorProps {
        [x: string]: HTMLElement | null
    }

    const [anchorEl, setAnchorEl] = useState<AnchorProps>({});

    const hideMenu = (item: Columns) => {
        setAnchorEl({})
    }

    const getIndex = (item: Columns) => {
        // const index = Object.keys(filterState).findIndex(x => x === item.dataField);

        // if (index > -1) return `#${index + 1}`
        // else 
        const { dataField, dataType } = item;

        if (dataType === "date" || dataType === "datetime" || dataType === "time") {
            const { icon } = betweenDuplicateState[dataField as any] || {};
            return icon ? <i className={`dx-icon-${icon} fs-20`} /> : ""
        }
        else return ""
    }

    return <div className="bgs-sidebar-table">
        <div className="header-table bgs-sidebar-table-header" style={{ backgroundColor: "#f3f3f3" }}>
            <div className="d-flex align-items-center justify-content-between hg-52 pdl-15 pdr-13">
                <div>
                    <BgsTypography className="fw-bold fs-16 text-secondary bgs-sidebar-table-header-title" sx={{ marginTop: "-7px !important" }}>Advanced Search</BgsTypography>
                    <BgsTypography className="fw-900 fs-14 text-secondary lh-8 bgs-sidebar-table-header-desc">{searchShow ? "Search by" : "Filter by"}</BgsTypography>
                </div>
                <div className="bgs-sidebar-table-header-toolbar">
                    <BgsButton className="shadow-none p-0 min-wt-0 br-tr-0 br-br-0 hg-25 wt-32 bgs-sidebar-table-header-toolbar-btn-search" size="small" variant={searchShow ? "contained" : "outlined"} onClick={() => setSearchShow(true)}><SearchRoundedIcon className="fs-16" /></BgsButton>
                    <BgsButton className="shadow-none p-0 min-wt-0 br-tl-0 br-bl-0 hg-25 wt-32 bgs-sidebar-table-header-toolbar-btn-filter" size="small" variant={!searchShow ? "contained" : "outlined"} onClick={() => setSearchShow(false)}><FilterAltRoundedIcon className="fs-16" /></BgsButton>
                </div>
            </div>
        </div>
        <div className="position-relative scroll p-3 pe-2 bgs-sidebar-table-content" style={{ overflowY: "scroll", maxHeight: `calc(48px * ${limitState} + 56px + 15px)`, height: "100%", backgroundColor: "#f3f3f3", borderTop: "2px solid #e9e9e9" }}>
            {(searchShow && Object.keys(criteriaState).length > 0) && <div className="d-flex align-items-center justify-content-end">
                <BgsButton onClick={() => (setCriteriaState({}), setCriteriaTypeState("OR"))} variant="text" className="hg-20 mgb-10 bgs-sidebar-table-content-btn-reset">Reset search</BgsButton>
            </div>}
            {(!searchShow && (Object.keys(filterState).length > 0 || Object.keys(betweenState).length > 0)) && <div className="d-flex align-items-center justify-content-end">
                <BgsButton onClick={() => (setFilterState({}), setBetweenDuplicateState({}), setBetweenState({}))} variant="text" className="hg-20 mgb-10 bgs-sidebar-table-content-btn-reset">Reset filter</BgsButton>
            </div>}
            <div className={`d-flex align-items-center justify-content-between ${!searchShow && "d-none"} bgs-sidebar-table-content-form-search-type`}>
                <BgsTypography className="fw-900 fs-14 text-secondary lh-8">Search Type</BgsTypography>
                <BgsForm {...formCriteria} ref={formCriteriaRef} className={`no-label-floating search-type`} />
            </div>
            <BgsForm {...formSearch} ref={formSearchRef} className={`mgt-20 no-label-floating ${!searchShow && "d-none"} bgs-sidebar-table-content-form-search`} />
            {!searchShow && Children.toArray(itemsFilter.map((item, index) => <div className="d-flex align-items-center justify-content-between w-100 mgb-20 no-label-floating bgs-sidebar-table-content-form-filter">
                <TextField
                    label={item.caption}
                    className="bg-white"
                    size="small"
                    fullWidth
                    variant="outlined"
                    value={returnValue(item, filterState, betweenState)}
                    defaultValue={returnValue(item, filterState, betweenState)}
                    placeholder={item.caption}
                    InputProps={{
                        className: "no-label-input",
                        readOnly: true,
                        sx: { cursor: "pointer" },
                        startAdornment: <InputAdornment position="start"><Badge color="primary" badgeContent={returnValue(item, filterState, betweenState, true)}><FilterAltOutlinedIcon sx={{ color: "#0000006b" }} /></Badge></InputAdornment>,
                        endAdornment: <InputAdornment position="end"><BgsTypography className="text-secondary fs-14" sx={{ fontStyle: "italic !important" }}>{getIndex(item)}</BgsTypography></InputAdornment>,
                    }}
                    inputProps={{
                        sx: { cursor: "pointer" },

                    }}
                    key={item.dataField}
                    onClick={event => setAnchorEl({ [item.dataField as any]: event.currentTarget })}
                />
                <Menu
                    anchorEl={anchorEl[item.dataField as any]}
                    open={Boolean(anchorEl[item.dataField as any])}
                    onClose={() => hideMenu(item)}
                    PaperProps={{
                        sx: {
                            padding: 0
                        },
                    }}
                    MenuListProps={{
                        sx: {
                            padding: 0
                        },
                    }}
                >
                    {(item.dataType === "date" || item.dataType === "datetime" || item.dataType === "time")
                        ? <FilterRangeModal
                            criteriaTypeState={criteriaTypeState}
                            column={item}
                            hide={() => hideMenu(item)}
                            helper={helper}
                            parameter={parameter}
                            limitState={limitState}
                            pageState={pageState}
                            tableRef={tableRef}
                            criteriaState={criteriaState}
                            betweenState={betweenState}
                            betweenDuplicateState={betweenDuplicateState}
                            filterState={filterState}
                            onSubmit={(value, option) => {
                                if (!value) delete betweenState[item.dataField as any], delete betweenDuplicateState[item.dataField as any]
                                setBetweenState({
                                    ...betweenState,
                                    ...value && { [item.dataField as any]: value }
                                })
                                setBetweenDuplicateState({
                                    ...betweenDuplicateState,
                                    ...option && { [item.dataField as any]: option }
                                })
                                hideMenu(item)
                            }}
                        />
                        : <FilterModal
                            column={item}
                            criteriaTypeState={criteriaTypeState}
                            hide={() => hideMenu(item)}
                            helper={helper}
                            parameter={parameter}
                            limitState={limitState}
                            pageState={pageState}
                            tableRef={tableRef}
                            criteriaState={criteriaState}
                            filterState={filterState}
                            onSubmit={(value = []) => {
                                if (!value.length) delete filterState[item.dataField as any]
                                setFilterState({
                                    ...filterState,
                                    ...value.length && { [item.dataField as any]: value }
                                })
                                hideMenu(item)
                            }}
                        />}
                </Menu>
            </div>))}
        </div>
    </div>
}
export default BgsTableSidebar;