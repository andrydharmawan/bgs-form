import { useState, PropsWithChildren } from 'react';
import { BgsTableHeaderProps, Columns } from "../models/table.model";
import { summary } from "../lib";
import Checkbox from "@mui/material/Checkbox";
import Badge from "@mui/material/Badge";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import BgsButton from "../form/button";
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import bgsModal from "../modal/modal";
import FilterModal from "./filter-modal";
import React from 'react';
import { FormModel } from "../models/models";
import bgsMenu from "../menu/menu";
import FilterRangeModal from "./range-modal";

export interface GridSortItem {
    /**
     * The column field identifier.
     */
    field: string;
    /**
     * The direction of the column that the grid should sort.
     */
    sort: "asc" | "desc";
}

type GridSortModel = GridSortItem[];


interface ColumnShowFiltering {
    type: "criteria" | "filter" | "sort";
    caption: string;
    dataField: string;
    value: string;
}

export const Highlighted = ({ text = "", highlight = "" }: { text: any, highlight?: any }) => {
    let parts: any = "";
    if (typeof text === "number") parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
    else {
        if (!text) text = "";
        parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    }

    return <span> {parts.map((part: any, i: any) =>
        <span key={i} style={part.toString().toLowerCase() === highlight?.toString()?.toLowerCase() ? { backgroundColor: "#337ab7", color: "#fff" } : {}}>
            {part}
        </span>)
    } </span>;
}

export const IconHeader = ({ icon }: Columns): JSX.Element => {
    // "boolean" | "key" | "list" | "image" | "date" | "url" | "tree" | "mail" | "hastag" | "browse" | "text" | "user"
    let icons = "";
    if (icon) switch (icon) {
        case "boolean":
            icons = "ri-toggle-line";
            break;
        case "key":
            icons = "ri-key-line";
            break;
        case "list":
            icons = "ri-list-check";
            break;
        case "image":
            icons = "ri-image-line";
            break;
        case "date":
            icons = "ri-calendar-line";
            break;
        case "url":
            icons = "ri-link";
            break;
        case "tree":
            icons = "ri-mind-map";
            break;
        case "mail":
            icons = "ri-mail-line";
            break;
        case "hastag":
            icons = "ri-hashtag";
            break;
        case "browse":
            icons = "ri-global-line";
            break;
        case "text":
            icons = "ri-text";
            break;
        case "user":
            icons = "ri-user-line";
            break;
        case "lock":
            icons = "ri-lock-line";
            break;
        case "search":
            icons = "ri-search-line";
            break;
        default:
            icons = "ri-text";
            break;
    }

    return <>{icon && <i className={`${icons} mgr-5`}></i>}</>
}

const BgsTableHeader = ({
    allowSelection = { enabled: false, mode: "multiple", selectionMode: "allpage", dataField: "allowSelection" },
    helper,
    parameter,
    showIndexing,
    masterDetail,
    totalRecordState,
    setSelectionDataState,
    limitState,
    pageState,
    tableRef,
    criteriaState,
    colSickyLeft,
    colSickyRight,
    columnsState,
    loadingState,
    dataSourceState,
    sortState,
    setSortState,
    filterState,
    setFilterState,
    selectionKeyDataState,
    setSelectionKeyDataState,
    selectAll,
    setSelectAll,
    criteriaTypeState,
    betweenState,
    setBetweenState,
    betweenDuplicateState,
    setBetweenDuplicateState,
    showIcon
}: PropsWithChildren<BgsTableHeaderProps>) => {
    if (allowSelection) allowSelection = { enabled: true, mode: "multiple", selectionMode: "allpage", dataField: "allowSelection", width: 55, ...typeof allowSelection === "object" ? allowSelection : {} }
    const handleSortChange = (newModel: GridSortModel) => {
        setSortState(newModel);
    };

    const selectAllData = (value: boolean) => {
        value = !(selectionKeyDataState.length === totalRecordState)
        setSelectAll(value)
        if (!value) setSelectionKeyDataState([]), setSelectionDataState([])
    }

    const actionFilter = (column: Columns, anchorEl: HTMLElement) => {
        const { dataField: field, dataType } = column;
        if (dataType === "date" || dataType === "datetime" || dataType === "time") {
            bgsMenu({
                anchorEl,
                render: e => <FilterRangeModal
                    criteriaTypeState={criteriaTypeState}
                    column={column}
                    hide={e.hide}
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
                        if (!value) delete betweenState[field as any], delete betweenDuplicateState[field as any]
                        setBetweenState({
                            ...betweenState,
                            ...value && { [field as any]: value }
                        })
                        setBetweenDuplicateState({
                            ...betweenDuplicateState,
                            ...option && { [field as any]: option }
                        })
                        e.hide()
                    }}
                />
            })
        }
        else bgsModal({
            className: "bgs-modal-filter-table",
            render: (e) => <FilterModal
                criteriaTypeState={criteriaTypeState}
                column={column}
                hide={e.hide}
                helper={helper}
                parameter={parameter}
                limitState={limitState}
                pageState={pageState}
                tableRef={tableRef}
                criteriaState={criteriaState}
                filterState={filterState}
                onSubmit={(value = []) => {
                    if (!value.length) delete filterState[field as any]
                    setFilterState({
                        ...filterState,
                        ...value.length && { [field as any]: value }
                    })
                    e.hide()
                }}
            />
        })
    }

    const [visibleHeaderSort, setVisibleHeaderSort] = useState<string | null | undefined>(null)

    const findWidthSticky = (column: Columns) => {
        const { sticky, dataField } = column;
        if (sticky === "left") {
            const index = colSickyLeft.findIndex(x => x === dataField);

            let width = 0;
            if (index > 0) {
                let fields: string[] = [];
                colSickyLeft.forEach((field, rowIndex) => {
                    if (rowIndex < index) fields.push(field)
                })
                const data = [
                    ...typeof allowSelection === "object" ? [allowSelection] : [],
                    ...typeof showIndexing === "object" ? [showIndexing] : [],
                    ...columnsState
                ].filter(x => fields.includes(x.dataField || ""))
                width = summary(data, "width");
            }

            return width; //index === 0 ? 0 : columnsState.find(x => x.dataField === colSickyLeft[index - 1])?.width
        }
        else if (sticky === "right") {
            const index = colSickyRight.findIndex(x => x === dataField)

            let width = 0;
            if (index > 0) {
                let fields: string[] = [];
                colSickyRight.forEach((field, rowIndex) => {
                    if (rowIndex < index) fields.push(field)
                })
                const data = [
                    ...typeof allowSelection === "object" ? [allowSelection] : [],
                    ...typeof showIndexing === "object" ? [showIndexing] : [],
                    ...columnsState
                ].filter(x => fields.includes(x.dataField || ""))
                width = summary(data, "width");
            }

            return width
        }
        else return 0
    }

    const numberOfFilter = (column: Columns): number => {
        const findIndex = Object.keys(filterState).findIndex(x => x === column.dataField)
        const findIndexBetween = Object.keys(betweenState).findIndex(x => x === column.dataField)
        return findIndex === -1 ? (findIndexBetween === -1 ? 0 : (findIndexBetween + 1)) : (findIndex + 1)
    }

    return (
        <TableHead>
            <TableRow>
                {(typeof allowSelection === "object" && allowSelection.enabled && allowSelection.mode === "multiple") && <TableCell
                    sx={{
                        maxWidth: typeof allowSelection === "object" ? (allowSelection.width || 55) : 55,
                        minWidth: typeof allowSelection === "object" ? (allowSelection.width || 55) : 55,
                        textAlign: "center",
                        ...typeof allowSelection === "object" && allowSelection.sticky === "left"
                            ? { position: "sticky", top: 0, left: findWidthSticky(allowSelection), zIndex: 2 }
                            : (typeof allowSelection === "object" && allowSelection.sticky === "right" ? { position: "sticky", top: 0, right: findWidthSticky(allowSelection), zIndex: 2 } : null)
                    }}
                    {...typeof allowSelection === "object" && allowSelection.sticky ? {
                        className: allowSelection.sticky === "left" ? (colSickyLeft.findIndex(z => z === ((allowSelection as any)?.dataField || "allowSelection")) === colSickyLeft.length - 1 ? "sticky-left" : "") : (allowSelection.sticky === "right" ? (colSickyRight.findIndex(z => z === ((allowSelection as any)?.dataField || "allowSelection")) === colSickyRight.length - 1 ? "sticky-right" : "") : "")
                    } : null}
                    width={typeof allowSelection === "object" ? (allowSelection.width || 55) : 55}
                >
                    <Checkbox
                        onClick={() => selectAllData(!selectAll)}
                        edge="start"
                        checked={!loadingState && dataSourceState.length ? (selectionKeyDataState.length === totalRecordState) : false}
                        indeterminate={dataSourceState.length ? (selectionKeyDataState.length === totalRecordState ? false : !!selectionKeyDataState.length) : !!dataSourceState.length}
                        tabIndex={-1}
                        disabled={!dataSourceState.length}
                        disableRipple
                        inputProps={{ 'aria-labelledby': "select-all" }}
                    />
                </TableCell>}
                {masterDetail?.enabled && <TableCell rowSpan={2} width={55} sx={{ maxWidth: 55 }}>
                </TableCell>}
                {showIndexing && <TableCell
                    width={typeof showIndexing === "object" ? (showIndexing.width || 60) : 60}
                    sx={{
                        maxWidth: typeof showIndexing === "object" ? (showIndexing.width || 60) : 60,
                        minWidth: typeof showIndexing === "object" ? (showIndexing.width || 60) : 60,
                        textAlign: "center",
                        ...typeof showIndexing === "object" && showIndexing.sticky === "left"
                            ? { position: "sticky", top: 0, left: findWidthSticky(showIndexing), zIndex: 2 }
                            : (typeof showIndexing === "object" && showIndexing.sticky === "right" ? { position: "sticky", top: 0, right: findWidthSticky(showIndexing), zIndex: 2 } : null)
                    }}
                    {...typeof showIndexing === "object" && showIndexing.sticky ? {
                        className: showIndexing.sticky === "left" ? (colSickyLeft.findIndex(z => z === showIndexing.dataField) === colSickyLeft.length - 1 ? "sticky-left" : "") : (showIndexing.sticky === "right" ? (colSickyRight.findIndex(z => z === showIndexing.dataField) === colSickyRight.length - 1 ? "sticky-right" : "") : "")
                    } : null}
                >
                    <span className={`d-flex align-items-center w-100 justify-content-${typeof showIndexing === "object" ? (showIndexing.headerAlign === "right" ? "end" : (showIndexing.headerAlign === "center" ? "center" : "start")) : "center"}`}>{showIcon ? IconHeader(showIndexing as any) : ""} {typeof showIndexing === "object" ? (showIndexing.caption || "No.") : "No."}</span>
                </TableCell>}
                {columnsState.map((x, index) => (
                    <TableCell
                        rowSpan={2}
                        width={x.width}
                        className={`${x.headerClassName || ""} ${(x.allowSorting && visibleHeaderSort === x.dataField) || (x?.dataField && sortState?.find(y => y.field === x.dataField)) ? "allow-sorting" : ""}`}
                        {...x.sticky ? {
                            className: x.sticky === "left" ? (colSickyLeft.findIndex(z => z === x.dataField) === colSickyLeft.length - 1 ? "sticky-left" : "") : (x.sticky === "right" ? (colSickyRight.findIndex(z => z === x.dataField) === colSickyRight.length - 1 ? "sticky-right" : "") : "")
                        } : null}
                        sx={{
                            minWidth: x.width,
                            maxWidth: x.width,
                            cursor: x.allowSorting ? "pointer" : "default",
                            ...x.sticky === "left"
                                ? { position: "sticky", top: 0, left: findWidthSticky(x), zIndex: 2 }
                                : (x.sticky === "right" ? { position: "sticky", top: 0, right: findWidthSticky(x), zIndex: 2 } : null)
                        }}
                        key={index}
                    >
                        <div className="d-flex w-100" style={{ height: "100%" }}>
                            <div className={`d-flex user-select-none align-items-center min-wt-0 w-100 justify-content-between`} style={{ height: "100%" }}>
                                <div
                                    {...x.allowSorting && x.dataField
                                        ? {
                                            onClick: () => handleSortChange(sortState?.find(y => y.field === x.dataField)?.sort === "desc" ? [] : [{ field: x.dataField || "", sort: sortState?.find(y => y.field === x.dataField) ? "desc" : "asc" }]),
                                            onMouseEnter: () => setVisibleHeaderSort(x.dataField),
                                            onMouseLeave: () => setVisibleHeaderSort(null)
                                        }
                                        : null}
                                    style={{ height: "100%" }}
                                    className={`d-flex user-select-none align-items-center min-wt-0 w-100 overflow-hidden fx-2 text-nowrap`}
                                >
                                    <div
                                        className="d-flex align-items-center h-100 w-100"
                                    >
                                        <div className={`text-truncate w-100 text-${x.headerAlign === "right" ? "end" : (x.headerAlign === "center" ? "center" : "start")}`} title={x.headerTemplate ? x.headerTemplate() : x.caption}>
                                            <span className="d-flex align-items-center">
                                                {showIcon ? IconHeader(x) : ""}
                                                {x.headerTemplate ? x.headerTemplate() : x.caption}
                                            </span>
                                        </div>
                                        {(x.allowSorting && visibleHeaderSort === x.dataField) || (x?.dataField && sortState?.find(y => y.field === x.dataField))
                                            ? <BgsButton variant="icon" className="hg-25 wt-25" title={!sortState?.find(y => y.field === x.dataField)?.sort ? "sort to asc" : (sortState?.find(y => y.field === x.dataField)?.sort === "asc" ? "sort to desc" : "clear sorting")}>
                                                <ArrowUpwardIcon className={x?.dataField && sortState?.find(y => y.field === x.dataField) ? "" : "c-grey-200"} sx={{
                                                    fontSize: 16,
                                                    transition: '0.1s',
                                                    transform: sortState?.find(y => y.field === x.dataField)?.sort === "desc" ? 'rotate(-180deg)' : 'rotate(0)'
                                                }} />
                                            </BgsButton>
                                            : <div className="hg-25 wt-32" />}
                                    </div>
                                </div>


                                {(x.allowFiltering && x.dataField) && <Badge color="primary" badgeContent={numberOfFilter(x)} variant="dot">
                                    <div>
                                        <BgsButton variant="icon" className="hg-25 wt-25" onClick={({ event }) => actionFilter(x, event.currentTarget)}>
                                            <i className={`ri-filter-3-line fs-18 ${!!numberOfFilter(x) ? "" : "c-grey-200"}`}></i>
                                            {/* <FilterAltRoundedIcon className={x?.dataField && sortState?.find(y => y.field === x.dataField) ? "" : "c-grey-200"} sx={{ fontSize: 18 }} /> */}
                                        </BgsButton>
                                    </div>
                                </Badge>}
                            </div>
                        </div>
                    </TableCell>)
                )}
            </TableRow>
        </TableHead>
    );
}

export default BgsTableHeader;