export declare type DatePickerView = 'year' | 'day' | 'month';
import { UseFormReturn } from "react-hook-form/dist/types";
import { ResponseModel, TableModel } from "./models";
import { ModalFunc } from "..";
import { ModalConfirmation } from "../modal/modalconfirmation";
import { ParameterRetrieve } from "./request.model";
import { Columns, HeaderIcon, TableRef } from "./table.model";

export type TypeInput = undefined | null | "summaryvalidation" | "input" | "select" | "radiobutton" | "button" | "buttongroup" | "checkbox" | "checkboxgroup" | "date" | "textarea" | "upload" | "template" | "switch" | "number" | "mask" | "label" | "autocomplete";

type ItemType = undefined | null | "group";

interface validationCallback {
    message: string;
    type?: "pattern" | "function";
    validation: ((value: any, formRef: FormRef) => boolean) | object;
}

export type ValidationRulesModel<T = string> = validationCallback | "required" | "min.[number]" | "max.[number]" | "email" | "match.[dataField]" | "pattern.alphabet" | "pattern.phonenumber"
    | "pattern.alphanumber" | "pattern.name" | "pattern.number" | "pattern.lowerspace" | "pattern.lowercase" | "pattern.alphanumberunderdash" | string;

type InputModel =
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week'
    | (string & {});

type Mode = 'date' | 'datetime' | 'time' | "month" | 'daterange' | 'popup' | 'default';

export interface ModalOptions {
    title?: string;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    height?: number | string;
    minHeight?: number | string;
    maxHeight?: number | string;
    closeOnOutside?: boolean;
    render?: (e: ModalFunc) => void;
}

interface OnChangeOptions {
    value: any;
    data: any;
    formRef: FormRef;
}

interface MenuOptions<T = ((e: ActionDefaultButton) => any), U = boolean> {
    items: MenuOptionsItems<T, U>[];
    className?: string;
}

interface MenuOptionsItems<T = ((e: ActionDefaultButton) => any), U = boolean> {
    text?: string;
    onClick?: T;
    className?: string;
    disabled?: boolean;
    suffix?: string | Function;
    prefix?: string | Function;
    visible?: U;
    to?: string;
    actionType?: "modal" | "menu";
    actionCode?: string;
    modalOptions?: ModalConfirmation;
}

interface Config {
    showSuccess?: boolean,
    showError?: boolean,
    usingToken?: boolean,
    headers?: any,
    onUploadProgress?: (e: any) => any
}

interface AfterRefresh {
    data: any;
    formRef: FormRef;
}

interface FileProps {
    id: string;
    fileExtention: string;
    fileName: string;
    fileSize: number;
    modul?: string;
    originalName: string;
}

export interface EditorOptions {
    [x: string]: any;
    placeholder?: string;
    className?: string;//Specifies a CSS class to be applied to the form item.
    onClick?: (event: ActionDefaultButton, formRef: FormRef) => any;//handling click on button click
    suffix?: any | Function;//add component after main content
    prefix?: any | Function;//add component before main content
    displayExpr?: string | ((data: any, index: number) => string);//Specifies the data field whose values should be displayed.
    valueExpr?: string;//Specifies which data field provides unique values to the UI component's value.
    isFirstLoad?: boolean;
    isAlwaysNew?: boolean;
    parameter?: (formRef: FormRef) => ParameterRetrieve;
    onChange?: (option: OnChangeOptions) => any;
    helper?: (data: any, callback?: ((response: ResponseModel) => (any | ResponseModel)), config?: Config) => any;//Configures to helper
    items?: ItemsButton[];//Holds an array of form items.
    mode?: Mode;//mode for specific element
    iconPrefix?: string;
    iconSuffix?: string;
    iconUpload?: (props: FileProps) => any;
    iconRemoveUpload?: (props: FileProps) => any;
    dataSource?: any;//Binds the UI component to data.
    type?: InputModel;//type model of input
    text?: string | Function;//text for label button
    disabled?: boolean;//Specifies whether the UI component responds to user interaction.
    readOnly?: boolean;//Specifies whether the UI component responds to user interaction.
    maxSize?: number;
    maxFile?: number;
    accept?: string;
    tableOptions?: TableModel;
    multiple?: boolean;
    rows?: number;
    maxRows?: number;
    minRows?: number;
    aligned?: "horizontal" | "vertical";
    horizontalAlignment?: "left" | "right" | "center";
    textAlignment?: "left" | "right" | "center";
    verticalAlignment?: 'bottom' | 'center' | 'top';
    format?: FormatModel;
    views?: DatePickerView[];
    openTo?: DatePickerView;
    minDate?: Date | string | moment.Moment;
    maxDate?: Date | string | moment.Moment;
    size?: 'small' | 'medium' | 'large';
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
    variant?: 'text' | 'outlined' | 'contained' | 'icon';
    visible?: boolean;
    afterChange?: AfterChange;
    afterRefresh?: (props: AfterRefresh) => void;
    parameterFromField?: ParameterFromField[];
    actionType?: "modal" | "menu";
    menuOptions?: MenuOptions<((event: ActionDefaultButton, formRef: FormRef) => any)>;
    loading?: boolean;
    withoutParentDisabled?: boolean;
    search?: Search | string | string[];
    sorting?: Sorting | string | string[];
    defaultParameter?: DefaultParameter[];
    allowClear?: boolean;
    allowSelectAll?: boolean;
    showArrow?: boolean;
    positionIcon?: "left" | "right" | "none";
    renderOption?: (data: DataSourceModel) => JSX.Element
    width?: string | number;
    disabledOption?: string[];
    modalOptions?: ModalOptions;
    renderTemplate?: (value: any, data: any, formRef: FormRef) => JSX.Element;
    beforeUpload?: (file: BeforeUpload, formRef: FormRef) => any;
    afterUpload?: (response: ResponseModel) => any;
    allowDeleting?: boolean;
    actionCode?: string;
    minNumber?: number;
    maxNumber?: number;
    maxLength?: number;
    autoComplete?: string;
}

interface BeforeUpload {
    file?: Blob | File;
    name: string;
    type: string;
    size: number;
}

interface DataSourceModel {
    displayExpr: string;
    valueExpr: string;
    data: any;
}
interface Search {
    enabled: boolean;
    opt: "criteria" | "filter" | "data";
    propReq: string | string[];
}

interface Sorting {
    enabled: boolean;
    detail: SortingDetail[] | SortingDetail;
}

interface SortingDetail {
    propReq: string;
    opt: "asc" | "desc";
}

interface AfterChange {
    clearItems?: string[];
    reloadItems?: string[];
}

interface ParameterFromField {
    opt: "criteria" | "filter" | "data";
    fromField: string;
    propReq: string;
}

interface DefaultParameter {
    opt: "criteria" | "filter" | "sort" | "data";
    value: any;
    propReq: string;
}

export interface EditorOptionsTable {
    [x: string]: any;
    className?: string;//Specifies a CSS class to be applied to the form item.
    onChange?: Function;//handling value change
    onClick?: (event: ActionDefaultButton, formRef: FormRef) => any;//handling click on button click
    suffix?: any | Function;//add component after main content
    prefix?: any | Function;//add component before main content
    displayExpr?: string | Function;//Specifies the data field whose values should be displayed.
    valueExpr?: string | Function;//Specifies which data field provides unique values to the UI component's value.
    isFirstLoad?: boolean;
    isAlwaysNew?: boolean;
    parameter?: Function;
    helper?: Function;//Configures to helper
    mode?: Mode;//mode for specific element
    iconPrefix?: string;
    iconSuffix?: string;
    dataSource?: any;//Binds the UI component to data.
    type?: InputModel;//type model of input
    text?: string | Function;//text for label button
    disabled?: boolean;//Specifies whether the UI component responds to user interaction.
    readOnly?: boolean;//Specifies whether the UI component responds to user interaction.
    maxSize?: number;
    maxFile?: number;
    accept?: string;
    tableOptions?: TableModel;
    multiple?: boolean;
    rows?: number;
    maxRows?: number;
    minRows?: number;
    aligned?: "horizontal" | "vertical";
    format?: FormatModel;
    views?: DatePickerView[];
    openTo?: DatePickerView;
    minDate?: Date | string;
    maxDate?: Date | string;
    size?: 'small' | 'medium' | 'large';
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
    variant?: 'text' | 'outlined' | 'contained' | 'icon';
    visible?: boolean;
    items?: ItemsButtonTable[];
}

interface FormatModel {
    mode?: "mask" | "number" | "date";

    //date
    display?: string;
    value?: string;

    mask?: string;//date or mask

    //mask
    definitions?: any;
    //number
    prefix?: string;
    thousandSeparator?: string;
    decimalSeparator?: string;
    isNumericString?: boolean;
}

export interface Label {//Specifies properties for the form item label.
    [x: string]: any;
    text?: string;//Specifies the label text.
    hint?: any;//Text for the form field hint.
    visible?: boolean;
    showColon?: boolean;
    className?: string;
    icon?: HeaderIcon;
}

export interface ItemsButton {
    [x: string]: any;
    name?: string;//key name button
    visible?: boolean | Function;
    text?: string;//Specifies the label text.
    className?: string;
    disabled?: boolean;
    onClick?: (event: ActionDefaultButton, formRef: FormRef) => any;
    size?: 'small' | 'medium' | 'large';
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" | undefined;
    variant?: 'text' | 'outlined' | 'contained' | 'icon';
    type?: string | "submit" | "button";
    suffix?: string | Function;
    prefix?: string | Function;
    actionCode?: string;
    to?: string;
    actionType?: "modal" | "menu";
    withoutParentDisabled?: boolean;
    menuOptions?: MenuOptions<((event: ActionDefaultButton, formRef: FormRef) => any)>;
    modalOptions?: ModalOptions;
}

export interface ActionDefaultButton {
    loading: (value: boolean) => any;
    event: React.MouseEvent<HTMLElement>;
    modalRef: ModalRef;
    menuRef: MenuRef;
    formRef: FormRef;
    data?: any;
}

export interface MenuRef {
    hide: Function;
    closeOnOutsideDisabled: (value: boolean) => any;
}

export interface ModalRef {
    hide: Function;
    closeOnOutsideDisabled: (value: boolean) => any;
}

interface QuerryParam<T = any> {
    [x: string]: T
}

export interface ActionClick {
    data: any;
    rowIndex: number;
    column: Columns;
    tableRef: TableRef;
    router: {
        push: (url: string) => any,
        pathname: string,
        query: QuerryParam,
        location: string,
        history: Function
    };
    loading: (value: boolean) => any;
    modalRef: ModalRef;
    menuRef: MenuRef;
    event: React.MouseEvent<HTMLElement>;
}

export interface ItemsButtonTable {
    name?: string;//key name button
    visible?: boolean | ((actionClick: ActionClick) => boolean);
    text?: string;//Specifies the label text.
    className?: string;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" | undefined;
    variant?: 'text' | 'outlined' | 'contained' | 'icon';
    type?: string | "submit" | "button";
    suffix?: string | Function;
    prefix?: string | Function;
    actionCode?: string;
    title?: string;
    onClick?: (actionClick: ActionClick) => any;
    actionType?: "modal" | "menu";
    menuOptions?: MenuOptions<((actionClick: ActionClick) => any), (boolean | ((actionClick: ActionClick) => boolean))>;
}

export interface Template {
    item: Items;
    formControl: UseFormReturn;
    formRef: FormRef;
    value: any;
    data: any;
    onChange: Function;
    onBlur: Function;
    ref: any;
    setValue: (value: any) => void,
    label: any;
    invalid: boolean;
    disabled: boolean;
}

export interface Items {
    [x: string]: any;
    colSpan?: number;//Specifies the number of columns spanned by the item.
    colCount?: number;//The count of columns in the form layout.
    itemType?: ItemType;//Specifies the item's type.
    spacing?: number;//The count of columns in the form layout.
    template?: (props: Template) => any;//A template that can be used to replace the default editor with custom content.
    editorOptions?: EditorOptions;//editorOptions should contain the properties of the editor specified in the editorType. Because of this dependency, editorOptions cannot be typed and are not implemented as nested configuration components. In these frameworks, specify editorOptions with an object. We recommend that you declare the object outside the configuration component to prevent possible issues caused by unnecessary re-rendering. Alternatively, you can configure a custom editor in a template.
    dataField?: string;//Specifies the path to the formData object field bound to the current form item.
    validationRules?: ValidationRulesModel[];//An array of validation rules to be checked for the form item editor.
    label?: Label;//Specifies properties for the form item label.
    editorType?: TypeInput;//Specifies which editor UI component is used to display and edit the form item value.
    name?: string;//Specifies a name that identifies the form item.
    items?: (Items | string | null)[];//Holds an array of form items.
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    caption?: string;
    visible?: boolean;
    dataType?: "boolean" | "string" | "date" | "number" | "datetime" | "time";
    actionType?: "modal" | "menu";
    menuOptions?: MenuOptions;
    modalOptions?: ModalOptions;
    actionCode?: string;
}

export type Variant = 'outlined' | 'filled' | 'standard';
export type FloatLabelType = 'always' | 'never' | 'auto';

export default interface FormModel<T = any> {
    // [x: string]: any;
    apperance?: Variant;
    floatLabel?: FloatLabelType;
    formData?: T;//Provides the Form's data. initialized value
    colCount?: number;//The count of columns in the form layout.
    spacing?: number;//The count of columns in the form layout.
    disabled?: boolean;//Specifies whether the UI component responds to user interaction.
    readOnly?: boolean;//Specifies whether the UI component responds to user interaction.
    className?: string;//Specifies a CSS class to be applied to the form item.
    items?: (Items | string | null)[];//Holds an array of form items.
    onSubmit?: (data: T, formRef: FormRef) => any;//handling submit form
    formGroup?: any;
    name?: string;
    item?: ChildFormGroup<T>;
    loadPanel?: boolean;
    loading?: boolean;
    setFocus?: Function;
    group?: ChildFormGroup<T>;
    showLabelShrink?: boolean;
    showIcon?: boolean;
}

interface FormGroupChildren {
    disabled: boolean;
    readOnly: boolean;
    formData: any;
    formGroup: any;
    ref: any;
    item: ChildFormGroup
}

export interface FormGroupModel<T = any> {
    formData?: any;//Provides the Form's data. initialized value
    disabled?: boolean;//Specifies whether the UI component responds to user interaction.
    readOnly?: boolean;//Specifies whether the UI component responds to user interaction.
    className?: string;//Specifies a CSS class to be applied to the form item.
    item: ChildFormGroup<T>;//Holds an array of form items.
    onSubmit?: (data: T, formRef: FormRef) => any;//handling submit form
    render?: (e: any) => any;
    apperance?: Variant;
    loadPanel?: boolean;
    spacing?: number;//The count of columns in the form layout.
    showLabelShrink?: boolean;
    showIcon?: boolean;
}

interface ChildFormGroup<T = any> {
    [x: string]: FormModel<T> | (Items | string | null);
}

export interface ResItemOption {
    option: (key?: string, value?: string | Items | EditorOptions | FormatModel | boolean | number | null) => ResOption;
}

interface DataSourceSelectModel {
    displayExpr: string;
    valueExpr: string;
    data: any;
}

export interface ResOption extends Items {
    refresh: Function;
    getDataSource: Function;
    getDataSelected: () => DataSourceSelectModel;
    setDisabledOption: (key: string[]) => any;
}

export interface FormRef {
    updateData: (key: any, data?: any) => any;//Merges the passed data object with formData. Matching properties in formData are overwritten and new properties added.
    loading: (value: boolean) => any;//show panel loading in form
    formControl: UseFormReturn;//Gets an editor instance. Takes effect only if the form item is visible.
    itemOption: (key: string) => ResItemOption;//Gets a form item's configuration. and set value | NB: jika ingin set value pastikan value yg inigin diset sudah didefaultkan
    reset: (key?: string | string[]) => any;//resets the editor's value to undefined.
    // addItem: Function;//add item for dynamic items
    // removeItem: Function;//remove item with specific name or dataField
    getData: (key?: string) => any;//Gets all data
    disabled: (value: boolean) => any;
    readOnly: (value: boolean) => any;
    btnSubmit: (value: boolean | string, type?: "visible" | "disabled" | "text" | "loading") => any;
    setError: (message: string | null) => any;
    to: (value: string) => any;
    name?: string;
    triggerSubmit: Function;
}
export interface PropsForm<T = any> {
    item: Items;
    formControl: UseFormReturn;
    indexKey?: number;
    formRef: FormRef;
    name?: string;
    apperance?: Variant;
    loading?: boolean;
    group?: ChildFormGroup<T>;
    spacing: number;
    showLabelShrink: boolean;
    showIcon: boolean;
}

interface PathCRUD {
    [x: string]: any;
    title: string;
    mode: "create" | "edit" | "detail";
    key: string | null;
}

export type CallbackMounted = (pt: PathCRUD) => any;