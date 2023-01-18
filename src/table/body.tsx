import { useState, PropsWithChildren, forwardRef, ForwardedRef, useImperativeHandle, useRef, useEffect, createRef } from 'react';
import { Columns, BgsTableBodyProps } from "../models/table.model";
import { getFieldValue, summary } from "../lib";
import { Checkbox } from "@mui/material";
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BgsButton from "../form/button";
import React from 'react';

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

interface RowComponentProps extends BgsTableBodyProps {
    row: any,
    rowIndex: number,
    criteriaState: any,
    focus: number | null | undefined,
    setFocus: (value: number | null | undefined) => void,
    elRefs: any
}

export interface RowComponentRefProps {
    clearCollapseMasterDetail: Function;
    rowRef: any;
}

const RowComponent = forwardRef(({
    row,
    rowIndex,
    allowSelection = { enabled: false, mode: "multiple", selectionMode: "allpage" },
    showIndexing,
    onRowClick,
    masterDetail,
    keyData = "id",
    loadingState = false,
    colSickyLeft = [],
    columnsState = [],
    tableRef,
    columnSetSearch,
    colSickyRight,
    criteriaText,
    selectionKeyDataState,
    setSelectionKeyDataState,
    selectionDataState,
    setSelectionDataState,
    criteriaState,
    onRowPrepared,
    focus,
    setFocus,
    limitState,
    dataSourceState,
    elRefs
}: RowComponentProps, ref: ForwardedRef<RowComponentRefProps>) => {
    if (allowSelection) allowSelection = { enabled: true, mode: "multiple", dataField: "allowSelection", selectionMode: "allpage", ...typeof allowSelection === "object" ? allowSelection : {} }

    const { onRowDisabledSelection } = typeof allowSelection === "object" ? allowSelection : { onRowDisabledSelection: () => false }

    const disabledSelection = onRowDisabledSelection ? onRowDisabledSelection({ rowIndex, rowData: row }) : false;

    const [historyCollapseMasterDetail, setHistoryCollapseMasterDetail] = useState<number[]>([]);
    const [collapseMasterDetail, setCollapseMasterDetail] = useState<number[]>([])
    const rowRef = useRef()

    useImperativeHandle(ref, () => ({
        clearCollapseMasterDetail: () => {
            setHistoryCollapseMasterDetail([])
            setCollapseMasterDetail([])
        },
        rowRef
    }));

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

    let totalColSpan = 0;

    if (masterDetail?.enabled) totalColSpan += 1;
    if ((typeof allowSelection === "boolean" && allowSelection) || (typeof allowSelection === "object" && allowSelection.enabled)) totalColSpan += 1;
    if (showIndexing) totalColSpan += 1;

    const labelId = `checkbox-list-label-${rowIndex}`;

    const { className = "" } = onRowPrepared({ rowData: row, rowIndex, tableRef });

    const allowFocus = ((typeof allowSelection === "object" ? allowSelection.enabled : false) || !!onRowClick) && !disabledSelection;

    const tableRow: any = {
        tabIndex: 0,
        onKeyDown: ({ key, keyCode }: KeyboardEvent) => {
            if (keyCode === 38 && typeof focus === "number") {
                const index = focus === 0 ? null : focus - 1;
                setFocus(index)
                try {
                    if (index !== null && elRefs[index]) elRefs[index].current.rowRef.current.focus()
                } catch (error) {

                }
            }
            else if (keyCode === 40 && typeof focus === "number") {
                const index = focus >= (limitState - 1) ? null : focus + 1;
                setFocus(index)
                try {
                    if (index !== null && elRefs[index]) elRefs[index].current.rowRef.current.focus()
                } catch (error) {

                }
            }
            else if (keyCode === 13 && typeof focus === "number" && onRowClick) {
                if (focus > -1 && dataSourceState[focus]) onRowClick({ rowData: dataSourceState[focus], rowIndex, columns: null as any })
            }
            else if (keyCode === 27) {
                setFocus(null)
            }
        },
        onFocus: () => setFocus(rowIndex)
    }

    return <>
        <TableRow ref={rowRef} {...allowFocus ? tableRow : {}} className={`${rowIndex % 2 === 0 ? "even" : "odd"} ${(selectionKeyDataState.includes(row[keyData]) && !disabledSelection) && "row-selected"} ${(typeof allowSelection === "object" && allowSelection.enabled && allowSelection.mode === "single") && "allow-selection"} ${rowIndex === focus ? "focus" : ""} ${className}`}>
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
                    onClick={() => {
                        setSelectionKeyDataState(selectionKeyDataState.indexOf(row[keyData]) > -1 ? selectionKeyDataState.filter(x => x !== row[keyData]) : [...selectionKeyDataState, row[keyData]])
                        setSelectionDataState(selectionDataState.filter((x: any) => x[keyData] === row[keyData]).length > 0 ? selectionDataState.filter((x: any) => x[keyData] !== row[keyData]) : [...selectionDataState, row])
                    }}
                    edge="start"
                    checked={!loadingState && selectionKeyDataState.indexOf(row[keyData]) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                    disabled={disabledSelection}
                />
            </TableCell>}
            {masterDetail?.enabled && <TableCell width={55} sx={{ maxWidth: 55, textAlign: "center" }}>
                <BgsButton visibleLoading={false} className="text-center" variant="icon" onClick={({ loading }) => {
                    loading(true)
                    setTimeout(() => {
                        setCollapseMasterDetail(collapseMasterDetail.includes(rowIndex) ? collapseMasterDetail.filter(x => x !== rowIndex) : [...collapseMasterDetail, rowIndex])

                        if (!historyCollapseMasterDetail.includes(rowIndex)) setHistoryCollapseMasterDetail([...historyCollapseMasterDetail, rowIndex])

                        loading(false)
                    })
                }}>
                    <ChevronRightIcon
                        sx={{
                            transform: collapseMasterDetail.includes(rowIndex) ? 'rotate(90deg)' : 'rotate(0)',
                            transition: '0.2s',
                            fontSize: 17
                        }}
                    />
                </BgsButton>
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
                onClick={(e) => {
                    onRowClick && !disabledSelection && onRowClick({
                        rowData: row,
                        columns: null as any,
                        rowIndex
                    })
                    if (typeof allowSelection === "object" && allowSelection.enabled && allowSelection.mode === "single") {
                        setSelectionKeyDataState(selectionKeyDataState.indexOf(row[keyData]) > -1 ? [] : [row[keyData]])
                        setSelectionDataState(selectionDataState.filter((x: any) => x[keyData] === row[keyData]).length > 0 ? [] : [row])
                    }
                }}>
                {Number(rowIndex + 1)}.
            </TableCell>}
            {columnsState.map((x, index) => (
                <TableCell
                    onClick={(e) => {
                        onRowClick && !disabledSelection && onRowClick({
                            rowData: row,
                            columns: x,
                            rowIndex
                        })
                        if (typeof allowSelection === "object" && allowSelection.enabled && allowSelection.mode === "single") {
                            setSelectionKeyDataState(selectionKeyDataState.indexOf(row[keyData]) > -1 ? [] : [row[keyData]])
                            setSelectionDataState(selectionDataState.filter((x: any) => x[keyData] === row[keyData]).length > 0 ? [] : [row])
                        }
                    }}
                    width={x.width}
                    key={index}
                    className={`${x.className || ""} ${typeof x.truncateText === "boolean" ? (x.truncateText ? "truncate-text" : "") : "truncate-text"} aa`}
                    align={x.aligned}
                    {...x.sticky ? {
                        className: x.sticky === "left" ? (colSickyLeft.findIndex(z => z === x.dataField) === colSickyLeft.length - 1 ? "sticky-left" : "sticky-left-secondary") : (x.sticky === "right" ? (colSickyRight.findIndex(z => z === x.dataField) === colSickyRight.length - 1 ? "sticky-right" : "sticky-right-secondary") : "")
                    } : null}
                    sx={{
                        minWidth: x.width,
                        maxWidth: x.width,
                        ...x.sticky === "left"
                            ? { position: "sticky", top: 0, left: findWidthSticky(x), zIndex: 1 }
                            : (x.sticky === "right" ? { position: "sticky", top: 0, right: findWidthSticky(x), zIndex: 1 } : null)
                    }}
                >
                    <div className={`d-flex justify-content-${x.aligned === "right" ? "end" : (x.aligned === "center" ? "center" : "start")} w-100`}>
                        {typeof x.template === "function" ? x.template(row, rowIndex, x, tableRef) : ((x.dataField && criteriaState[x.dataField]) ? <Highlighted text={getFieldValue(row, x.dataField)} highlight={criteriaState[x.dataField]} /> : getFieldValue(row, x.dataField))}
                    </div>
                </TableCell>)
            )}
        </TableRow>
        {(masterDetail?.enabled && collapseMasterDetail.includes(rowIndex)) && <TableRow>
            <TableCell className="bgs-table-masterdetail" colSpan={columnsState.length + totalColSpan} sx={{ bgcolor: "#e4e4e4" }}>
                {masterDetail?.template(row, rowIndex, tableRef, historyCollapseMasterDetail.includes(rowIndex))}
            </TableCell>
        </TableRow>}
    </>
})

import { v4 } from "uuid";

const BgsTableBody = forwardRef(({
    dataSourceState = [],
    pageState,
    limitState,
    ...others
}: PropsWithChildren<BgsTableBodyProps>, ref: ForwardedRef<RowComponentRefProps>) => {
    const [key, setKey] = useState<string>("body-key")
    const [focus, setFocus] = useState<number | undefined | null>(null);
    const rowRef: any = useRef([])
    const [elRefs, setElRefs] = useState([])

    useImperativeHandle(ref, () => ({
        clearCollapseMasterDetail: () => {
            setKey(v4())
        },
        rowRef
    }));

    useEffect(() => {
        // add or remove refs
        setElRefs((elRefs) =>
            Array(dataSourceState.length)
                .fill(null)
                .map((_, i) => elRefs[i] || createRef()),
        );
    }, [dataSourceState.length])

    return (
        <>
            <TableBody key={key}>
                {dataSourceState.map((row: any, rowIndex: number) => (
                    <RowComponent elRefs={elRefs} ref={elRefs[rowIndex]} focus={focus} setFocus={setFocus} pageState={pageState} limitState={limitState} key={rowIndex} row={row} rowIndex={Number(rowIndex) + (pageState === 1 ? 0 : Number(limitState * (pageState - 1)))} {...others} dataSourceState={dataSourceState} />
                ))}
            </TableBody>
        </>
    );
})

export default BgsTableBody;