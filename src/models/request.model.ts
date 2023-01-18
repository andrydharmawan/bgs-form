export default interface RequestModel {
    parameter?: Parameter | ParameterRetrieve;
    paging?: Paging;
}

export interface ParameterRetrieve {
    column?: string[];
    sort?: any;
    criteria?: any;
    data?: any;
    criteriaType?: string;
    filter?: any;
    [x: string]: any;
}

export interface Parameter {
    data?: any;
}

export interface Paging {
    page?: number;
    limit?: number;
}