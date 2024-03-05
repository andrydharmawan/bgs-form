import { useParams, useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import { useMemo } from "react";

export default function useRouter() {
    const params = useParams();
    const location = useLocation();
    const history = useNavigate();

    return useMemo(() => {
        return {
            push: history,
            pathname: location.pathname,
            query: {
                ...queryString.parse(location.search),
                ...params,
            },
            location,
            history,
        };
    }, [params, location, history]);
}

interface QuerryParam<T = any> {
    [x: string]: T
}

export interface BgsRouterProps {
    push: (url: string) => any,
    pathname: string,
    query: QuerryParam,
    location: string,
    history: Function
}