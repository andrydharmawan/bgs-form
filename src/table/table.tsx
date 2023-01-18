import React, { useState, useEffect, ForwardedRef, forwardRef, useImperativeHandle, PropsWithChildren, useRef } from 'react';
import { ResponseModel, TableModel } from "../models/models";
import { Columns, TableRef, HeaderIcon } from "../models/table.model";
import { v4 } from "uuid";
import { EditorOptionsTable } from "../models/form.model";
import { formatCurrency, getFieldValue, isArray, jsonCopy, sorting, split } from "../lib";
import Box from '@mui/material/Box';
import BgsButtonGroup from "../form/buttongroup";
import BgsSpinner from "../form/spinner";
import Alert from "@mui/material/Alert";
import moment from "moment";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";

import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import bgsConfigureStore, { ConfigureStore, storeDispatch } from "../store";
import BgsTableBody, { RowComponentRefProps } from "./body";
import BgsTableHeader from "./header";
import BgsTableFooter from "./footer";
import BgsTableToolbar, { BgsTableToolbarRef } from "./toolbar";
import Slide from "@mui/material/Slide";
import BgsTableSidebar from "./sidebar";
import Paper from "@mui/material/Paper";

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

interface ColumnSearch {
    caption: string;
    dataField: string;
}

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

const shutdownFiture = false;

const BgsTable = forwardRef(({
    allowReordering = true,
    allowSearching = false,
    allowSearchingOptions = false,
    allowRefreshing = false,
    allowSortingOptions = false,
    allowSelection = { enabled: false, mode: "multiple", selectionMode: "allpage" },
    columns = [],
    dataSource,
    helper,
    paging = { enabled: true },
    parameter,
    title,
    showIndexing,
    allowFilteringShow = true,
    height,
    onRowClick,
    defaultParameter: defaultParameterOptions,
    temporaryParameter,
    masterDetail,
    isFirstLoad: isFirstLoadDefault = true,
    store,
    keyData = "id",
    buttonSelect,
    toolbar = {
        position: "left",
        items: []
    },
    className,
    searchFocus = true,
    searchInput,
    showIcon = false,
    onRowPrepared = () => ({ className: "" })
}: PropsWithChildren<TableModel>, ref: ForwardedRef<TableRef>) => {
    if (allowSelection) allowSelection = { enabled: true, mode: "multiple", selectionMode: "allpage", width: 55, ...typeof allowSelection === "object" ? allowSelection : {}, dataField: "allowSelection" }
    if (showIndexing) showIndexing = { headerAlign: "center", width: 60, icon: false, ...typeof showIndexing === "object" ? showIndexing : {}, dataField: "showIndexing" }

    useImperativeHandle(ref, () => (tableRef));

    const { table = [] }: ConfigureStore = store?.configureStore ? (store?.configureStore.getState() || {}) : {};
    const {
        sort = [],
        limit = 0,
        criteria = {},
        filter = {},
        page = 0,
        between = {}
    } = store?.keyStore ? (table.find(x => x.key === store.keyStore) || {
        sort: [],
        limit: 0,
        criteria: {},
        page: 0,
    }) : {};

    const [dataSourceState, setDataSourceState] = useState<any>([]);
    const [columnsState, setColumnsState] = useState<Columns[]>([]);
    const [loadingState, setLoadingState] = useState<boolean>(false);
    const [pageState, setPageState] = useState<number>(page || (paging?.pageIndex || 1));
    const [limitState, setLimitState] = useState<number>(limit || (paging?.pageSize || 10));
    const [totalRecordState, setTotalRecordState] = useState<number>(0);
    const [criteriaState, setCriteriaState] = useState<any>(searchInput || criteria);
    const [statusState, setStatusState] = useState<boolean>(true);
    const [messageError, setMessageError] = useState<string>("");
    const [columnSearch, setColumnSearch] = useState<ColumnSearch[]>([]);
    const [columnSort, setColumnSort] = useState<ColumnSearch[]>([]);
    const [columnSetSearch, setColumnSetSearch] = useState<string[]>([]);
    const [columnShowFiltering, setColumnShowFiltering] = useState<ColumnShowFiltering[]>([]);
    const toolbarRef = useRef<BgsTableToolbarRef>(null);
    const [colSickyLeft, setColSickyLeft] = useState<string[]>([])
    const [colSickyRight, setColSickyRight] = useState<string[]>([])
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(isFirstLoadDefault);
    const [criteriaText, setCriteriaText] = useState<string | undefined | null>();
    const [selectionKeyDataState, setSelectionKeyDataState] = useState<string[]>([]);
    const [selectionDataState, setSelectionDataState] = useState<any>([]);
    const [sortState, setSortState] = useState<GridSortModel>(sort);
    const [filterState, setFilterState] = useState<any>(filter);
    const [betweenState, setBetweenState] = useState<any>(between);
    const [betweenDuplicateState, setBetweenDuplicateState] = useState<any>(between);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const refComponentMasterDetail = useRef<RowComponentRefProps>(null);
    const [openSidebar, setOpenSidebar] = useState<boolean>(false);
    const [criteriaTypeState, setCriteriaTypeState] = useState<"OR" | "AND">("OR");
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    useEffect(() => {
        if (!openSidebar && Object.values(criteriaState).length) setCriteriaState({}), setCriteriaTypeState("OR")
    }, [openSidebar])

    useEffect(() => {
        const mapColumns = remappingColumns(columns);

        let sorts: any = mapColumns.filter((x: any) => x?.sortOrder);

        if (isArray(sorts, 0) && sortState?.length === 0) {
            sorts = sorting.asc(sorts, "sortIndex").map(({ dataField: field, sortOrder: sort }: Columns) => {
                return {
                    field,
                    sort
                }
            });

            setSortState(sorts);
        }

        if (!columnSetSearch.length) {
            const columnsMap: ColumnSearch[] = mapColumns.filter((x: any) => x.allowSearching === undefined ? true : x.allowSearching)
                .filter((z: any) => !z?.dataField?.includes("template-bgs"))
                .map(({ dataField, caption }: any) => {
                    return {
                        dataField,
                        caption
                    }
                });

            setColumnSearch(columnsMap);
            setColumnSetSearch(columnsMap.map(x => x.dataField));
        }

        const columnsMap: ColumnSearch[] = mapColumns.filter((x: any) => x.allowSorting)
            .filter((z: any) => !z?.dataField?.includes("template-bgs"))
            .map(({ dataField, caption }: any) => {
                return {
                    dataField,
                    caption
                }
            });

        setColumnSort(columnsMap)

    }, [dataSourceState])

    useEffect(() => {
        if (isFirstLoad) refresh();

        if (store?.keyStore && store?.configureStore) {
            const srch = Object.keys(criteriaState);
            if (srch.length) {
                const search = isArray(srch, 0) ? criteriaState[srch[0]]?.toString()?.toLowerCase() : "";//.replace(/%/g, "")

                toolbarRef.current?.updateData({
                    search
                })
            }

            storeDispatch(store.configureStore, ({ table }) => {
                const findIndex = table.findIndex(x => x.key === store?.keyStore)

                if (findIndex === -1) {
                    table.push({
                        key: store.keyStore || "",
                        page: pageState,
                        limit: limitState,
                        sort: sortState,
                        criteria: criteriaState,
                        filter: filterState,
                        between: betweenState
                    })
                }
                else {
                    table[findIndex] = {
                        key: store.keyStore || "",
                        page: pageState,
                        limit: limitState,
                        sort: sortState,
                        criteria: criteriaState,
                        filter: filterState,
                        between: betweenState
                    }
                }

                return {
                    table
                }
            })
        }

        if (firstLoad && searchInput && Object.keys(searchInput).length) toolbarRef.current?.updateData({
            search: Object.values(searchInput)[0]
        })

        setFirstLoad(false)
        setCriteriaText(Object.keys(criteriaState).length ? criteriaState[Object.keys(criteriaState)[0]] : null)//.replace(new RegExp("%", 'g'), "")
    }, [criteriaState, pageState, limitState, sortState, isFirstLoad, filterState, criteriaTypeState, betweenState])

    useEffect(() => {
        if (columnsState.length) {
            let columns = columnsState.filter(x => x.dataField && x.sticky) || [];
            setColSickyLeft([
                ...typeof allowSelection === "object" && allowSelection.sticky === "left" ? [allowSelection.dataField as any] : [],
                ...typeof showIndexing === "object" && showIndexing.sticky === "left" ? [showIndexing.dataField as any] : [],
                ...columns.filter(x => x.sticky === "left").map(x => x.dataField || "")
            ])
            setColSickyRight(columns.filter(x => x.sticky === "right").map(x => x.dataField || "").reverse())
        }
    }, [columnsState])

    useEffect(() => {
        if (selectAll) refresh({ limit: totalRecordState, page: 1 })
    }, [selectAll])

    const getByKeyData = async (value: any) => {
        if (helper) {
            setLoadingState(true)
            let reqBody = {
                parameter: {
                    column: [],
                    sort: {},
                    criteria: {},
                    filter: {
                        [keyData]: value
                    }
                },
                paging: {
                    limit: totalRecordState || 999999999,
                    page: 1
                }
            };

            const { status, data }: ResponseModel = await helper(reqBody)
            setLoadingState(false)

            setSelectionDataState(status && isArray(data, 0) ? data.map(remapDataSource) : [])
        }
    }

    const refresh = async (param: { limit: number, page: number } | undefined | null = null) => {
        if (helper) {
            const { criteria, filter, criteriaType = criteriaTypeState, between, ...othersParameter }: any = parameter ? (parameter(tableRef) || {}) : {};
            let sort: any = {},
                defaultFilter: any = {
                    sort: {},
                    criteria: {},
                    filter: {},
                    between: {}
                },
                tempFilter: any = {
                    sort: {},
                    criteria: {},
                    filter: {},
                    between: {}
                };

            setLoadingState(true)
            if (isArray(sortState, 0) && sortState) {
                sortState.forEach(e => {
                    sort[e.field] = e.sort;
                })
            }


            if (defaultParameterOptions?.length) {
                defaultParameterOptions?.forEach(item => {
                    defaultFilter[item.opt][item.propReq] = item.value;
                });
            }

            if (temporaryParameter?.length) {
                temporaryParameter?.forEach(item => {
                    tempFilter[item.opt][item.propReq] = item.value;
                });
            }

            let reqBody = {
                parameter: {
                    // column: remappingColumns(columns).filter((x:any) => x.dataField).map((x:any) => x.dataField),
                    column: [],
                    sort: {
                        ...defaultFilter.sort,
                        ...sort,
                    },
                    criteria: {
                        ...defaultFilter.criteria,
                        ...criteriaState,
                        ...criteria,
                    },
                    filter: {
                        ...defaultFilter.filter,
                        ...filterState,
                        ...filter,
                    },
                    between: {
                        ...defaultFilter.between,
                        ...betweenState,
                        ...between,
                    },
                    criteriaType,
                    ...othersParameter
                },
                paging: {
                    limit: param ? param?.limit : limitState,
                    page: param ? param?.page : pageState
                }
            };

            if (!Object.keys(reqBody.parameter.sort).length) reqBody.parameter.sort = tempFilter.sort;
            if (!Object.keys(reqBody.parameter.criteria).length) reqBody.parameter.criteria = tempFilter.criteria;
            if (!Object.keys(reqBody.parameter.filter).length) reqBody.parameter.filter = tempFilter.filter;
            if (!Object.keys(reqBody.parameter.between).length) reqBody.parameter.between = tempFilter.between;

            const { status, data, paging, message, description }: ResponseModel = await helper(reqBody)
            const { totalrecord = 0 } = paging || {};

            if (Object.keys(reqBody.parameter.criteria) || Object.keys(reqBody.parameter.filter) || Object.keys(sort).length) {
                let searchData: any = [];
                Object.keys(reqBody.parameter.criteria).forEach(field => {
                    const value = reqBody.parameter.criteria[field]//.replace(/%/g, "");
                    const { caption = split.camelCase(field), dataField = field }: any = columnsState.find(x => x.dataField === field) || {};
                    searchData.push({ caption, dataField, type: "criteria", value })
                })

                Object.keys(sort).forEach(field => {
                    const value = sort[field];
                    const { caption = split.camelCase(field), dataField = field }: any = columnsState.find(x => x.dataField === field) || {};
                    searchData.push({ caption, dataField, type: "sort", value })
                })
                //filter not mapping
                if (!param) setColumnShowFiltering(searchData)
            }
            refComponentMasterDetail.current?.clearCollapseMasterDetail();
            setLoadingState(false)
            if (!param) setTotalRecordState(totalrecord)
            setStatusState(status)
            setMessageError(status ? "" : (message || description))
            if (!param) setDataSourceState(status && isArray(data, 0) ? data.map(remapDataSource) : [])
            else {
                if (selectAll) {
                    setSelectionKeyDataState(data.map(remapDataSource).map((x: any) => x[keyData]))
                    setSelectionDataState(data.map(remapDataSource))
                }
            }
        }
        else {
            if (isArray(dataSource, 0) && dataSource) {
                let dataSrc: any[] = jsonCopy(dataSource) || [];

                if (isArray(sortState, 0) && sortState) {
                    dataSrc = sorting[sortState[0]?.field === "asc" ? "asc" : "desc"](dataSrc, sortState[0]?.sort);
                }
                const srch = Object.keys(criteriaState);
                const search = isArray(srch, 0) ? criteriaState[srch[0]]?.toString()?.toLowerCase() : "";//.replace(/%/g, "")
                dataSrc = dataSrc
                    .filter((item: any) => {
                        const fields = Object.keys(item);
                        return fields.some(field => item[field]?.toString()?.toLowerCase().includes(search))
                    })
                    .splice(pageState === 1 ? 0 : ((pageState - 1) * limitState), limitState);


                refComponentMasterDetail.current?.clearCollapseMasterDetail();
                setTotalRecordState(dataSource.length)
                setDataSourceState(dataSrc.map(remapDataSource))
            }
        }
        setTimeout(() => {
            const { scrollLeft = 0, offsetWidth = 0, scrollWidth = 0 }: any = tableContainerRef.current || {};
            scrollEvent({ scrollLeft, offsetWidth, scrollWidth })
        }, 100)
    }

    const remapDataSource = (data: any) => {
        if (data[keyData]) {
            return data;
        }
        else return {
            [keyData]: v4(),
            ...data
        }
    }

    const setDataSource = (data: any) => {
        setDataSourceState(data.map(remapDataSource))
    }

    const addDataSource = (data: any) => {
        let dataSrc = [...dataSourceState];

        if (isArray(data, 0)) dataSrc = [...dataSrc, ...data]
        else dataSrc.push(data);

        setDataSourceState(dataSrc.map(remapDataSource))
    }

    const updateDataSource = (rowIndex: number, data: any) => {
        if (rowIndex !== -1) {
            let dataSrc = [...dataSourceState];

            dataSrc[rowIndex] = data;

            setDataSourceState(dataSrc.map(remapDataSource))
        }
    }

    const removeDataSourceByIndex = (rowIndex: number) => {
        if (rowIndex !== -1) {
            const dataSrc = [...dataSourceState];
            dataSrc.splice(rowIndex, 1)
            setDataSourceState(dataSrc.map(remapDataSource))
        }
    }

    const getDataSource = () => dataSourceState;

    const tableRef: TableRef = {
        refresh,
        loading: (value?: boolean) => loading(value),
        setDataSource: (data) => setDataSource(data),
        addDataSource: (data) => addDataSource(data),
        updateDataSource: (rowIndex, data) => updateDataSource(rowIndex, data),
        removeDataSourceByIndex: (rowIndex) => removeDataSourceByIndex(rowIndex),
        getDataSource,
        searchText: criteriaText,
        Highlighted: ({ text }) => <Highlighted text={text} highlight={criteriaText} />,
        setSelectionByKeyData: (props: any[]) => {
            if (props.length) {
                setSelectionKeyDataState(props)
                const notFind = props.filter(x => !dataSourceState.map((x: any) => x[keyData]).includes(x))
                if (notFind.length) getByKeyData(props)
                else setSelectionDataState(dataSourceState.filter((x: any) => props.includes(x[keyData])))
            }
        },
        getSelection: () => {
            return {
                data: selectionDataState,
                keyData: selectionKeyDataState
            }
        },
        setColumnsState: (columns) => setColumnsState(columns),
        columns: () => columnsState,
        setSearchInput: (value) => {
            setCriteriaState(value)
        }
    }

    useEffect(() => {
        if (typeof allowSelection === "object" && allowSelection.enabled && isArray(allowSelection?.selected, 0)) tableRef.setSelectionByKeyData(allowSelection?.selected || [])
    }, [])
    // console.log(accessRoles, "accessRoles")
    const remappingColumns = (columns: (Columns | string)[]) => {
        const { accessRoles = [] }: ConfigureStore = bgsConfigureStore.getState();
        // console.log(accessRoles, "accessRoles")
        const actionButton = columns.findIndex(x => typeof x === "object" && x.cellType === "action");

        if (actionButton > -1) {
            const findCol = columns[actionButton];
            if (typeof findCol === "object") {
                const access: string[] = accessRoles;
                const { items = [] }: EditorOptionsTable = findCol.cellOptions || {};
                let removeBtn: boolean[] = [];
                let btnAuth = items.filter(x => x.actionCode && x.actionType !== "menu");
                let btnMenu = items.filter(x => x.actionType === "menu");

                if (isArray(btnMenu, 0)) {
                    btnMenu.forEach(x => {
                        let btnAuth2 = x.menuOptions?.items?.filter(x => x.actionCode);

                        if (isArray(btnAuth2, 0)) {
                            const btnnoaccess = btnAuth2?.filter((x: any) => !access.includes(x.actionCode));
                            if (btnnoaccess?.length === x.menuOptions?.items?.length) removeBtn.push(true)
                            else removeBtn.push(false)
                        }
                    })
                }

                // console.log(btnAuth, access, "1btnAuth----------------------------------------------------------------------------------------")
                if (isArray(btnAuth, 0)) {
                    const btnnoaccess = btnAuth.filter((x: any) => !access.includes(x.actionCode));
                    // console.log(btnnoaccess, "btnnoaccess----------------------------------------------------------------------------------------")
                    if (btnnoaccess.length === items.filter(x => x.actionType !== "menu").length) removeBtn.push(true)
                    else removeBtn.push(false)
                }
                // console.log(removeBtn, "removeBtn")

                if (removeBtn.length > 0) if (removeBtn.filter(x => x).length === removeBtn.length) columns.splice(actionButton, 1)
            }
        }

        columns = columns.map((item, index) => {
            if (typeof item === "string") {
                let propertyField: Columns = {
                    allowSorting: true,
                    // width: 900 / columns.length,
                }

                item.split("|").forEach((prp, index) => {
                    if (index === 0) {
                        propertyField.dataField = prp;
                    }
                    else {
                        const dtlPrp = prp.split("=");
                        try {
                            if (dtlPrp[0] === "allowSorting" && dtlPrp.length === 1) propertyField[dtlPrp[0]] = true;
                            else if (dtlPrp[0] === "allowFiltering" && dtlPrp.length === 1) propertyField[dtlPrp[0]] = true;
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
                });

                if (!propertyField?.caption && propertyField?.dataField) propertyField.caption = split.camelCase(propertyField?.dataField);

                return {
                    ...propertyField,
                    aligned: propertyField.aligned || "left",
                    headerAlign: propertyField.headerAlign || (propertyField.aligned || "left"),
                    icon: icons(propertyField),
                    template: (data, rowIndex, column, tableRef) => {
                        let value = getFieldValue(data, column.dataField);
                        let { format, dataType } = propertyField;

                        if (value) {
                            switch (dataType) {
                                case "datetime":
                                    if (!format) format = "DD MMM YYYY HH:mm"
                                    value = moment(value).format(format)
                                    break;
                                case "date":
                                    if (!format) format = "DD MMM YYYY"
                                    value = moment(value).format(format)
                                    break;
                                case "time":
                                    if (!format) format = "HH:mm:ss"
                                    value = moment(value, "HH:mm:ss").format(format)
                                    break;
                                case "number":
                                    value = formatCurrency(value)
                                    break;
                            }
                        }

                        return <div className="truncate-text" title={value || ""}>{(column.dataField && criteriaState[column.dataField]) ? <Highlighted text={value} highlight={criteriaState[column.dataField]} /> : value} </div>
                    }
                };
            }
            else {
                if (item.cellType === "action") {
                    return {
                        aligned: "center",
                        headerAlign: "center",
                        ...item,
                        allowExporting: item.allowExporting || (item.cellType === "action" ? false : true),
                        allowReordering: allowReordering && (item.allowReordering === undefined ? true : item.allowReordering),
                        caption: item.caption || "",
                        icon: icons(item),
                        template: (data, rowIndex, column) => {
                            const props = {
                                data,
                                rowIndex,
                                column,
                                tableRef,
                                router: {}
                            };
                            const items: any = item?.cellOptions?.items?.map(({
                                onClick = () => { },
                                visible,
                                actionType,
                                menuOptions,
                                actionCode,
                                ...otherProps
                            }) => {
                                if (typeof visible === "function") visible = visible(props as any)
                                // console.log(actionCode, "mapping actionCode -----------------------------------------------")

                                return {
                                    ...otherProps,
                                    visible,
                                    actionType,
                                    actionCode,
                                    onClick: (e: any) => onClick({
                                        ...props as any,
                                        ...e as any
                                    }),
                                    ...actionType === "menu" ? {
                                        menuOptions: {
                                            ...menuOptions,
                                            items: menuOptions?.items.map(x => {
                                                let { visible = () => true, onClick: click = () => { } } = x;
                                                if (typeof visible === "function" && visible !== undefined) visible = visible(props as any)

                                                return {
                                                    ...x,
                                                    visible,
                                                    ...click !== undefined && typeof click === "function" ? {
                                                        onClick: (e: any) => click({
                                                            ...props as any,
                                                            ...e as any
                                                        })
                                                    } : null
                                                }
                                            }).filter(x => x.visible)
                                        }
                                    } : null
                                }
                            })

                            return <BgsButtonGroup formRef={props as any} item={{
                                editorOptions: {
                                    items
                                }
                            }} />
                        },
                        dataField: item.dataField || `template-bgs-action`
                    }
                }
                else {
                    if (item.template && !item.dataField) return {
                        ...item,
                        aligned: item.aligned || "left",
                        icon: icons(item),
                        headerAlign: item.headerAlign || (item.aligned || "left"),
                        allowExporting: item.allowExporting || (item.cellType === "action" ? false : true),
                        allowReordering: allowReordering && (item.allowReordering === undefined ? true : item.allowReordering),
                        caption: item.caption || "",
                        template: (data, rowIndex, column) => item.template ? item.template(data, rowIndex, column, tableRef) : () => { },
                        dataField: `template-bgs-${item.caption}-${index}`
                    }
                    else return {
                        ...item,
                        icon: icons(item),
                        allowExporting: item.allowExporting || (item.cellType === "action" ? false : true),
                        allowReordering: allowReordering && (item.allowReordering === undefined ? true : item.allowReordering),
                        caption: item.caption || (item?.dataField ? split.camelCase(item?.dataField) : ""),
                        aligned: item.aligned || "left",
                        headerAlign: item.headerAlign || (item.aligned || "left"),
                        ...item.template
                            ? {
                                template: (data, rowIndex, column) => item.template ? item.template(data, rowIndex, column, tableRef) : () => { }
                            } : {
                                template: (data, rowIndex, column) => {
                                    let value = getFieldValue(data, column.dataField);
                                    let { format, dataType } = item;

                                    if (value) {
                                        switch (dataType) {
                                            case "datetime":
                                                if (!format) format = "DD MMM YYYY HH:mm:ss"
                                                value = moment(value).format(format)
                                                break;
                                            case "date":
                                                if (!format) format = "DD MMM YYYY"
                                                value = moment(value).format(format)
                                                break;
                                            case "time":
                                                if (!format) format = "HH:mm:ss"
                                                value = moment(value, "HH:mm:ss").format(format)
                                                break;
                                            case "number":
                                                value = formatCurrency(value)
                                                break;
                                        }
                                    }

                                    return <div className="truncate-text">{(column.dataField && criteriaState[column.dataField]) ? <Highlighted text={value} highlight={criteriaState[column.dataField]} /> : value}</div>
                                }
                            }
                    }
                }
            }
        });

        setColumnsState(columns as any)

        return columns;
    }

    const icons = ({ dataType, icon, cellType }: Columns): HeaderIcon => {
        if (typeof icon !== "undefined" && typeof icon !== "object") return icon;

        if (cellType) return false

        if (showIcon) {
            switch (dataType) {
                case "string":
                    return "text";
                case "number":
                    return "text";
                case "boolean":
                    return "boolean";
                case "date":
                    return "date";
                case "datetime":
                    return "date";
                case "time":
                    return "date";
                default:
                    return "text";
            }
        }
        else return false
    }

    const loading = (value?: boolean) => {
        if (value !== undefined) setLoadingState(value)
        else setLoadingState(!loadingState)
    }

    const removeFilter = (index: number, type: string, dataField: string) => {
        let searchData = [...columnShowFiltering];
        switch (type) {
            case "criteria":
                let criteria = { ...criteriaState };
                delete criteria[dataField];
                if (!Object.keys(criteria).length) toolbarRef.current?.reset("search")
                setCriteriaState(criteria);
                break;
            case "sort":
                let sorting = [...sortState || []];
                const findIndexSort = sorting.findIndex(x => x.field === dataField);
                if (findIndexSort !== -1) sorting.splice(findIndexSort, 1);
                setSortState(sorting);
                break;
        }
        searchData.splice(index, 1);
        setColumnShowFiltering(searchData);
    }

    const tableContainerRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            const { scrollLeft = 0, offsetWidth = 0, scrollWidth = 0 }: any = tableContainerRef.current || {};
            scrollEvent({ scrollLeft, offsetWidth, scrollWidth })
        }, 100)
    }, [])

    interface ScrollEventProps {
        scrollLeft: number; offsetWidth: number; scrollWidth: number;
    }

    const scrollEvent = ({ scrollLeft = 0, offsetWidth = 0, scrollWidth = 0 }: ScrollEventProps) => {
        const start = scrollLeft > 0;
        const end = scrollLeft + offsetWidth < scrollWidth;
        const stickyRight = document.getElementsByClassName("sticky-right");
        const stickyLeft = document.getElementsByClassName("sticky-left");

        if (stickyRight.length) {
            for (let index = 0; index < stickyRight.length; index++) {
                end ? stickyRight[index].classList.add("shadow-right") : stickyRight[index].classList.remove("shadow-right");
            }
        }
        if (stickyLeft.length) {
            for (let index = 0; index < stickyLeft.length; index++) {
                start ? stickyLeft[index].classList.add("shadow-left") : stickyLeft[index].classList.remove("shadow-left");
            }
        }

    }

    window.onresize = () => {
        const { scrollLeft = 0, offsetWidth = 0, scrollWidth = 0 }: any = tableContainerRef.current || {};
        scrollEvent({ scrollLeft, offsetWidth, scrollWidth })
    }

    return (
        <div className={`${className}`}>
            <div style={{ width: "100%" }} className={`table-cresa overflow-hidden position-relative sidebar-masterdata bg-white p-0 ${loadingState ? "loading-table" : ""}`}>
                <BgsTableToolbar searchFocus={searchFocus} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} toolbar={toolbar} setSortState={setSortState} sortState={sortState} columnSort={columnSort} allowSortingOptions={allowSortingOptions} setPageState={setPageState} setCriteriaState={setCriteriaState} columnSearch={columnSearch} columnSetSearch={columnSetSearch}
                    setColumnSetSearch={setColumnSetSearch} setIsFirstLoad={setIsFirstLoad} refresh={refresh}
                    allowSearching={allowSearching} allowSearchingOptions={allowSearchingOptions} allowRefreshing={allowRefreshing} title={title} ref={toolbarRef} criteriaText={criteriaText}
                    loadingState={loadingState}
                />
                {allowFilteringShow && shutdownFiture
                    ? <div className="row">
                        <div className={`col d-flex flex-row overflow-auto scroll ${columnShowFiltering.length ? "p-2 ps-3" : ""}`}>
                            {columnShowFiltering.map(({ caption, type, value, dataField }, index) =>
                                <span key={index} className="me-1">
                                    <Chip
                                        label={<span><Chip className="hg-18 bg-grey-300 text-white pdl-1 pdr-1" label={type === "criteria" ? "search by" : (type === "sort" ? "sort by " + value : "")} /> <span className="ps-2 pe-2">{caption}</span></span>}
                                        onDelete={() => removeFilter(index, type, dataField)}
                                    />
                                </span>)
                            }
                        </div>
                    </div>
                    : null
                }
                <div style={{ width: "100%" }} className="position-relative">
                    <Grid container>
                        <Slide direction="right" in={openSidebar} mountOnEnter unmountOnExit>
                            <Grid item xs={3} sx={{ borderTop: "2px solid #ececec !important", borderRight: "2px solid #ececec !important" }}>
                                <BgsTableSidebar shutdownFiture={shutdownFiture} limitState={limitState} columnSearch={columnSearch} columnSetSearch={columnSetSearch} setCriteriaState={setCriteriaState}
                                    setPageState={setPageState} setIsFirstLoad={setIsFirstLoad} criteriaState={criteriaState}
                                    betweenDuplicateState={betweenDuplicateState} setBetweenDuplicateState={setBetweenDuplicateState}
                                    betweenState={betweenState} setBetweenState={setBetweenState}
                                    criteriaTypeState={criteriaTypeState} setCriteriaTypeState={setCriteriaTypeState} parameter={parameter} helper={helper} columnsState={columnsState} filterState={filterState} setFilterState={setFilterState} pageState={pageState} tableRef={tableRef} />
                            </Grid>
                        </Slide>
                        <Grid item xs={openSidebar ? 9 : 12}>
                            {(criteriaText && statusState && shutdownFiture) && <Alert severity="info">{totalRecordState ? <span>Showing 1 - {totalRecordState} data for <i className="fw-bold">"{[...new Set(Object.values(criteriaState)) as any].join(", ")}"</i></span> : <span>Try different keywords <i className="fw-bold">"{criteriaText}"</i> or remove search filter</span>}</Alert>}
                            <Grid container className="w-100">
                                <Grid item xs={12} sx={{ overflow: "hidden", position: "relative", width: 0 }}>
                                    <TableContainer ref={tableContainerRef} className="main-table position-relative scroll" sx={{ maxHeight: height, minHeight: height }}
                                        onScroll={(ref) => {
                                            const { scrollLeft = 0, offsetWidth = 0, scrollWidth = 0 } =
                                                ref.currentTarget || {};
                                            scrollEvent({ scrollLeft, offsetWidth, scrollWidth })
                                        }}>
                                        <Table>
                                            <BgsTableHeader showIcon={showIcon} criteriaTypeState={criteriaTypeState} setColumnsState={setColumnsState} allowSelection={allowSelection} totalRecordState={totalRecordState} setSelectionDataState={setSelectionDataState} pageState={pageState}
                                                limitState={limitState} tableRef={tableRef} criteriaState={criteriaState} colSickyLeft={colSickyLeft} colSickyRight={colSickyRight} columnsState={columnsState}
                                                dataSourceState={dataSourceState} loadingState={loadingState} sort={sort} filter={filter}
                                                masterDetail={masterDetail} parameter={parameter} helper={helper} showIndexing={showIndexing}
                                                sortState={sortState} setSortState={setSortState} filterState={filterState} setFilterState={setFilterState}
                                                betweenDuplicateState={betweenDuplicateState} setBetweenDuplicateState={setBetweenDuplicateState}
                                                betweenState={betweenState} setBetweenState={setBetweenState}
                                                selectionKeyDataState={selectionKeyDataState} setSelectionKeyDataState={setSelectionKeyDataState} selectAll={selectAll} setSelectAll={setSelectAll} />
                                            <BgsTableBody onRowPrepared={onRowPrepared} ref={refComponentMasterDetail} selectionDataState={selectionDataState} setSelectionDataState={setSelectionDataState} selectionKeyDataState={selectionKeyDataState} setSelectionKeyDataState={setSelectionKeyDataState} loadingState={loadingState} colSickyLeft={colSickyLeft} columnsState={columnsState} tableRef={tableRef}
                                                columnSetSearch={columnSetSearch} colSickyRight={colSickyRight} criteriaText={criteriaText} dataSourceState={dataSourceState} pageState={pageState} limitState={limitState}
                                                masterDetail={masterDetail} allowSelection={allowSelection} showIndexing={showIndexing} onRowClick={onRowClick} keyData={keyData} criteriaState={criteriaState} />
                                        </Table>
                                        {loadingState ? <div className="border shadow loading-container">
                                            <BgsSpinner size={35} className="loading-content mb-2" />
                                            Loading...
                                        </div>
                                            : null}
                                        {!dataSourceState.length
                                            ? <div style={{ position: "sticky", left: 0 }}>
                                                <Box className="MuiDataGrid-overlay d-flex align-items-center justify-content-center flex-column w-100 position-relative">
                                                    {!statusState ? <Alert onClose={() => setStatusState(true)} className="w-100" sx={{ position: "absolute", top: 0 }} severity="error">{messageError}</Alert> : null}
                                                    <Box className="p-5 d-flex align-items-center justify-content-center flex-column w-100" sx={{ maxHeight: height ? `calc(${height} - 41px)` : "", minHeight: height ? `calc(${height} - 41px)` : "" }}>
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
                                                    </Box>
                                                </Box>
                                            </div>
                                            : null}
                                    </TableContainer>
                                </Grid>
                            </Grid>
                            <BgsTableFooter allowSelection={allowSelection} pageState={pageState} setPageState={setPageState} limitState={limitState} setLimitState={setLimitState}
                                totalRecordState={totalRecordState} selectionKeyDataState={selectionKeyDataState} tableRef={tableRef}
                                paging={paging} buttonSelect={buttonSelect} />
                        </Grid>
                    </Grid>
                </div>
            </div>
        </div>
    );
})

export default BgsTable;