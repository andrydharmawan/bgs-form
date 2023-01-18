import { Store, createStore } from "redux";
import { setData } from "../redux/actions";
import reducers from "../redux/reducers";

interface BgsTable {
    key: string;
    page: number;
    limit: number;
    criteria: any;
    filter: any;
    between: any;
    sort: any;
}

export interface MenuPermissionWrapper {
    menuCode: string;
    menuName: string;
    menuIcon?: string;
    menuParent?: string;
    menuPath?: string;
    menuSort: number;
    details: Details[];
}

interface Details {
    functionCode: string;
    functionName: string;
}

export interface ConfigureStore {
    table: BgsTable[];
    accessRoles: string[];
    menu: MenuPermissionWrapper[];
}

export interface ConfigureStoreOptional {
    accessRoles?: string[];
    table?: BgsTable[];
    menu?: MenuPermissionWrapper[];
}

const state: ConfigureStore = {
    table: [],
    accessRoles: [],
    menu: []
}

const bgsConfigureStore = createStore(reducers, state);

export function storeDispatch(configureStore: Store, props: (ConfigureStoreOptional | ((data: ConfigureStore) => ConfigureStoreOptional))) {
    if (typeof props === "function") {
        configureStore.dispatch(setData(props(configureStore.getState())))
    }
    else configureStore.dispatch(setData(props))
}

export function bgsStoreDispatch(props: (ConfigureStoreOptional | ((data: ConfigureStore) => ConfigureStoreOptional))) {
    if (typeof props === "function") {
        bgsConfigureStore.dispatch(setData(props(bgsConfigureStore.getState())))
    }
    else bgsConfigureStore.dispatch(setData(props))
}

export default bgsConfigureStore;