import Typography from "@mui/material/Typography";
import { ModalFunc } from "./modal";
import BgsButton from "../form/button";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ModalConfirmation } from "./modalconfirmation";
import { useEffect, useState } from "react";
import React from "react";

export default function ContentConfirmation({
    title = "Confirm",
    message = "Are you sure want delete this data?",
    onClick = () => { },
    onHide = ({ hide }) => hide(),
    modalFunc,
    props
}: ModalConfirmation) {
    const [loadingState, setLoadingState] = useState<boolean>(false);

    const onClickDefault = ({ loading }:any) => {
        onClick({
            ...props,
            ...modalFunc,
            modalRef: {
                hide: () => modalFunc?.hide(),
                closeOnOutsideDisabled: (value:boolean) => modalFunc?.closeOnOutsideDisabled(value)
            },
            loading: (value) => {
                loading(value)
                setLoadingState(value)
                modalFunc?.closeOnOutsideDisabled(value)
            }
        })
    }

    return <div className="pdt-24 pdl-24 pdr-24 pdb-0 d-flex flex-column align-items-center text-start bgs-modal-confirmation">
        <Typography variant="h6" className="text-start w-100 mgb-16 bgs-modal-confirmation-title">
            {title}
        </Typography>
        <div className="d-flex align-items-center w-100 mgb-16 bgs-modal-confirmation-content">
            <HelpOutlineIcon className="text-warning me-2" sx={{ fontSize: 27 }} /> <p className="mb-1">{message}</p>
        </div>
        <div className="w-100 bgs-modal-confirmation-footer">
            <BgsButton variant="text" disabled={loadingState} onClick={() => onHide(modalFunc as any)} className="me-2 text-secondary wt-64 fw-bold bgs-modal-confirmation-btn-no">No</BgsButton>
            <BgsButton className="wt-64 bgs-modal-confirmation-btn-yes" onClick={(e) => onClickDefault(e)}>Yes</BgsButton>
        </div>
    </div>
}