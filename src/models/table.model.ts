import { Store } from "redux";
import { EditorOptionsTable, ItemsButton, ItemsButtonTable } from "./form.model";

type CellType = "action";
type Aligned = "center" | "left" | "right";

export interface Paging {
    pageIndex?: number;//Specifies the page to be displayed using a first-based index, default value 1
    pageSize?: number;//The page size determines how many rows the UI component loads at a time, default value 10
    enabled?: boolean;//Enables paging, default value true
    pageSizes?: number[];//Specifies the size of the page size selector. default value [10, 50, 100]
}

export interface FilteringOptions {
    helper?: (data: any) => any;//Configures to helper
    parameter?: (tableRef: TableRef) => any;
    searchBy?: string | string[];
    sortBy?: string;
    dataSource?: any;//Binds the UI component to data.
    displayExpr?: string | Function;//Specifies the data field whose values should be displayed.
    valueExpr?: string | Function;//Specifies which data field provides unique values to the UI component's value.
    renderOption?: (data: DataSourceModel) => JSX.Element;
    allowSearching?: boolean;
    allowSorting?: boolean;
    allowOptionSearching?: boolean;
}

interface DataSourceModel {
    displayExpr: string;
    valueExpr: string;
    data: any;
}

export interface Columns {
    [x: string]: any;
    dataField?: string;//Binds the column to a field of the dataSource.
    caption?: string;//Use this property to display a descriptive or friendly name for the column. If this property is not set, the caption will be generated from the name of the dataField
    dataType?: 'string' | 'number' | 'date' | 'datetime' | 'boolean' | "time";//Casts column values to a specific data type. string | date | datetime
    format?: string;//Formats a value before it is displayed in a column cell.
    sortOrder?: "asc" | "desc" | undefined | null;//By default, rows are sorted according to the data source. To sort rows in an ascending or descending order, set the sortOrder property to "asc" or "desc". If you need to sort by multiple columns, specify the sortIndex. Otherwise, each sorted column will get a sort index according to its position in the columns array.
    sortIndex?: number;//This property accepts an integer specifying the index of the column in a collection of columns with applied sorting. For example, consider the following data source that can provide data for three columns.
    width?: string | number;//Specifies the column's width in pixels or as a percentage
    visible?: boolean;//Specifies whether the column is visible, that is, occupies space in the table.
    allowResizing?: boolean;//Specifies whether a user can resize the column at runtime. Applies only if allowColumnResizing is true.
    allowSearching?: boolean;//Specifies whether this column can be searched. Applies only if allowSearching in parent property is true.
    allowFiltering?: boolean | FilteringOptions;//Specifies whether data can be filtered by this column.
    allowReordering?: boolean;//Specifies whether this column can be used in column reordering at runtime
    allowSorting?: boolean;//Specifies whether a user can sort rows by this column at runtime
    showInColumnChooser?: boolean;//Specifies whether the column chooser can contain the column header.
    template?: (data: any, rowIndex: number, column: Columns, tableRef: TableRef) => any;//Specifies a custom template for data cells.
    headerTemplate?: Function;
    aligned?: Aligned;//Aligns the content of the column. Accepted Values: undefined | 'center' | 'left' | 'right'
    headerAlign?: Aligned;
    cellType?: CellType;
    cellOptions?: EditorOptionsTable;
    allowExporting?: boolean;
    description?: string;
    maxWidth?: number;//Specifies the column's width in pixels or as a percentage
    minWidth?: number;//Specifies the column's width in pixels or as a percentage
    sticky?: "left" | "right";
    columns?: (Columns | string)[];
    className?: string | null | undefined;
    headerClassName?: string | null | undefined;
    truncateText?: boolean;
    icon?: HeaderIcon
}

export type HeaderIcon = boolean | "boolean" | "key" | "list" | "image" | "date" | "url" | "tree" | "mail" | "hastag" | "browse" | "text" | "user" | "lock" | "search"

interface AllowSelection extends Columns {
    enabled?: boolean;
    onChange?: Function;
    mode?: "single" | "multiple";
    selectionMode?: "allpage" | "perpage";
    selected?: any[];
    onRowDisabledSelection?: (props: OnRowDisabledSelection) => boolean;
}

interface OnRowDisabledSelection {
    rowData: any;
    rowIndex: number;
}

interface AllowExporting {
    enabled?: boolean;
    fileName?: string;
}

interface OnRowClick {
    columns: Columns;
    rowData: any;
    rowIndex: number;
}

export default interface TableModel<T = any> {
    [x: string]: any;
    keyData?: string;
    title?: string | Function;
    showIndexing?: boolean | Columns;
    allowSelection?: boolean | AllowSelection;
    dataSource?: T,//Binds the UI component to data.
    columns: (Columns | string)[];//An array of grid columns.
    showIcon?: boolean;
    paging?: Paging;//Configures paging.
    allowResizing?: boolean;//Specifies whether a user can resize columns.
    allowSearching?: boolean | AllowSearchingProps;//Configures the search input.
    allowSearchingOptions?: boolean;//Configures the search input.
    allowExporting?: AllowExporting;
    allowSortingOptions?: boolean;//Configures the search input.
    allowFiltering?: boolean;//Configures the filter
    allowColumnChooser?: boolean;//Configures show the column chooser
    allowRefreshing?: boolean;//Configures show the column chooser
    helper?: (data: any) => any;//Configures to helper
    onRowClick?: (e: OnRowClick) => any;//A function that is executed when a row is clicked or tapped.
    parameter?: (tableRef: TableRef) => any;
    isFirstLoad?: boolean;
    masterDetail?: MasterDetail;
    allowFilteringShow?: boolean;
    height?: number | string;
    defaultParameter?: DefaultParameter[];
    temporaryParameter?: DefaultParameter[];
    disabledRowDataSelected?: T[];
    disabledRowIndexSelected?: number[];
    store?: StoreProps;
    buttonSelect?: ItemsButtonTable;
    toolbar?: Toolbar;
    className?: string;
    searchFocus?: boolean;
    searchInput?: SearchInput;
    onRowPrepared?: (props: OnRowPrepared) => OnRowPreparedResult;
}

interface OnRowPrepared {
    rowData: any;
    rowIndex: number;
    tableRef: TableRef;
}

interface OnRowPreparedResult {
    className?: string;
}

export interface SearchInput {
    [x: string]: string;
}

export interface BgsTableBodyProps {
    masterDetail?: MasterDetail;
    allowSelection: boolean | AllowSelection;
    showIndexing?: boolean | Columns;
    onRowClick?: (e: OnRowClick) => any;//A function that is executed when a row is clicked or tapped.
    keyData: string;
    loadingState: boolean;
    colSickyLeft: string[];
    colSickyRight: string[];
    columnsState: Columns[];
    tableRef: TableRef;
    columnSetSearch: string[];
    criteriaText: string | undefined | null;
    dataSourceState: any;
    pageState: number;
    limitState: number;
    selectionKeyDataState: string[];
    setSelectionKeyDataState: (value: string[]) => any;
    selectionDataState: any;
    setSelectionDataState: (value: any) => any;
    criteriaState: any;
    onRowPrepared: (props: OnRowPrepared) => OnRowPreparedResult;
}

export interface BgsTableHeaderProps {
    masterDetail?: MasterDetail;
    allowSelection: boolean | AllowSelection;
    parameter?: (tableRef: TableRef) => any;
    helper?: (data: any) => any;//Configures to helper
    showIndexing?: boolean | Columns;
    criteriaTypeState: "OR" | "AND";
    showIcon: boolean;
    totalRecordState: number;
    setSelectionDataState: Function;
    pageState: number;
    limitState: number;
    tableRef: TableRef;
    criteriaState: any;
    colSickyLeft: string[];
    colSickyRight: string[];
    columnsState: Columns[];
    dataSourceState: any;
    loadingState: boolean;
    sort: any;
    filter: any;
    sortState: GridSortModel;
    setSortState: (value: GridSortModel) => any;
    filterState: any;
    setFilterState: (value: any) => any;
    betweenState: any;
    setBetweenState: (value: any) => any;
    betweenDuplicateState: any;
    setBetweenDuplicateState: (value: any) => any;
    selectionKeyDataState: string[];
    setSelectionKeyDataState: (value: string[]) => any;
    selectAll: boolean;
    setSelectAll: (value: boolean) => any;
    setColumnsState: (columns: Columns[]) => any;
}

export interface BgsTableFooterProps {
    allowSelection: boolean | AllowSelection;
    paging?: Paging;//Configures paging.
    buttonSelect?: ItemsButtonTable;
    pageState: number;
    setPageState: (value: number) => any;
    limitState: number;
    setLimitState: (value: number) => any;
    totalRecordState: number;
    selectionKeyDataState: string[];
    tableRef: TableRef;
}

interface AllowSearchingProps {
    fullWidth?: boolean;
}

export interface BgsTableToolbarProps {
    allowSearching?: boolean | AllowSearchingProps;//Configures the search input.
    allowSearchingOptions?: boolean;//Configures the search input.
    allowRefreshing?: boolean;//Configures show the column chooser
    title?: string | Function;
    loadingState: boolean;

    setPageState: (value: number) => any;
    setCriteriaState: (value: any) => any;
    columnSearch: ColumnSearch[];
    columnSetSearch: string[];
    setColumnSetSearch: (value: string[]) => any;
    setIsFirstLoad: (value: boolean) => any;
    refresh: Function;
    criteriaText: string | undefined | null;
    allowSortingOptions: boolean;
    columnSort: ColumnSearch[];
    sortState: GridSortModel;
    setSortState: (value: GridSortModel) => any;
    toolbar: Toolbar;
    openSidebar: boolean;
    setOpenSidebar: (value: boolean) => void;
    searchFocus?: boolean;
}
export interface BgsTableSidebarProps {
    limitState: number;
    columnSearch: ColumnSearch[];
    columnSetSearch: string[];
    setCriteriaState: (value: any) => any;
    setPageState: (value: number) => any;
    setIsFirstLoad: (value: boolean) => any;
    criteriaState: any;
    criteriaTypeState: "OR" | "AND";
    setCriteriaTypeState: (value: "OR" | "AND") => void;
    shutdownFiture: boolean;
    parameter?: (tableRef: TableRef) => any;
    helper?: (data: any) => any;//Configures to helper
    columnsState: Columns[];
    filterState: any;
    setFilterState: (value: any) => any;
    pageState: number;
    tableRef: TableRef;
    betweenState: any;
    setBetweenState: (value: any) => any;
    betweenDuplicateState: any;
    setBetweenDuplicateState: (value: any) => any;
}

interface ItemsButtonMod extends ItemsButton {
    template?: () => any;
    locateIn?: "beforeSearch" | "afterSearch";
}

interface Toolbar {
    position?: "left" | "right";
    items: ItemsButtonMod[];
}

interface ColumnSearch {
    caption: string;
    dataField: string;
}

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


interface StoreProps {
    keyStore?: string;
    configureStore: Store;
}

interface DefaultParameter {
    opt: "criteria" | "filter" | "sort";
    value: any;
    propReq: string;
}

interface MasterDetail {
    enabled: boolean;
    column?: Columns;
    template: (data: any, rowIndex: number, tableRef: TableRef, isOpen: boolean) => any;
}

interface Highlighted {
    text: string
}

interface GetSelection {
    keyData: any[];
    data: any[];
}

export interface TableRef {
    refresh: Function;//Reloads data and repaints data rows.
    loading: Function;//show panel loading in data table
    setDataSource: (data: object) => any;
    addDataSource: (data: object) => any;
    updateDataSource: (rowIndex: number, data: any) => any;
    removeDataSourceByIndex: (rowIndex: number) => any;
    getDataSource: () => any[];
    searchText: string | undefined | null;
    Highlighted: (props: Highlighted) => any;
    setSelectionByKeyData: (props: any[]) => any;
    getSelection: () => GetSelection;
    setColumnsState: (columns: Columns[]) => any;
    columns: () => Columns[];
    setSearchInput: (value: SearchInput) => void;
}

interface OptionsModal {
    loading: Function;//show panel loading in data table
    close: Function;//show panel loading in data table
}

interface OptionsButton {
    loading?: Function;//show panel loading in data table
}

export interface TableOptionsAction<T = any> {
    data: T;
    index: number;
    column: Columns;
    modalOption?: OptionsModal;
    buttonOption?: OptionsButton;
    tableOption: TableRef;
}