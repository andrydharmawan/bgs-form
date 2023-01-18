
interface Paging {
    limit?: number;
    page?: number;
    totalpage?: number;
    totalrecord?: number;
}

export default interface ResponseModel<T = any> {
    status: boolean;
    data: T;
    paging?: Paging;
    message: string;
    description: string;
}

export type Callback = ((response: ResponseModel) => (any | ResponseModel))