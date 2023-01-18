import React, { PropsWithChildren } from 'react';
import { BgsTableFooterProps } from "../models/table.model";
import TablePagination from '@mui/material/TablePagination';
import BgsButton from "../form/button";

const BgsTableFooter = ({
    allowSelection = { enabled: false, mode: "multiple", selectionMode: "allpage" },
    paging = { enabled: true },
    buttonSelect,
    pageState,
    setPageState,
    limitState,
    setLimitState,
    totalRecordState,
    selectionKeyDataState,
    tableRef
}: PropsWithChildren<BgsTableFooterProps>) => {
    const { enabled = true, pageSizes = [10, 25, 50, 100] } = paging;
    if (typeof allowSelection === "boolean" && allowSelection) allowSelection = { enabled: true, mode: "multiple", selectionMode: "allpage" }

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPageState(newPage + 1);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setLimitState(parseInt(event.target.value, 10));
        setPageState(1);
    };

    const ButtonSelectMultipleComponent = (disabled: boolean) => {
        return <BgsButton
            {...buttonSelect as any}
            onClick={(props) => {
                if (buttonSelect?.onClick) buttonSelect?.onClick({
                    ...props as any,
                    tableRef: tableRef as any
                })
            }}
            disabled={!disabled}
        >{buttonSelect?.text || "Select"}</BgsButton>
    }

    return (
        <div className="w-100 bgs-table-footer">
            <div className="w-100 d-flex align-items-center justify-content-between">
                <div>
                    {(typeof allowSelection === "object" && allowSelection.enabled) && <div className="d-flex align-items-center">
                        <span className="fs-13" style={{ color: "#0000008a" }}>
                            <>
                                {typeof buttonSelect === "object" && buttonSelect && ButtonSelectMultipleComponent(selectionKeyDataState.length > 0)} {allowSelection.mode === "multiple" ? (selectionKeyDataState.length > 0 && <span className="ms-2">Total selected items <b>{selectionKeyDataState.length}</b></span>) : <>
                                    {/* {!buttonSelect && <Alert severity="info">Please click row table for selected data</Alert>} */}
                                </>}
                            </>
                        </span>
                    </div>}
                </div>
                {enabled ? <TablePagination
                    labelRowsPerPage="Items per page:"
                    component="div"
                    rowsPerPageOptions={pageSizes}
                    count={totalRecordState}
                    page={pageState - 1}
                    onPageChange={handleChangePage}
                    rowsPerPage={limitState}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    showFirstButton
                    showLastButton
                /> : null}
            </div>
        </div>
    );
}

export default BgsTableFooter;