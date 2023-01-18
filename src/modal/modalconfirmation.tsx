import { ActionClick, ModalOptions } from "../models/form.model";
import modal, { ModalFunc } from "./modal";
import ContentConfirmation from "./contentconfirmation";
import React from "react";

export interface ModalConfirmation extends ModalOptions {
    title?: string;
    message?: string;
    onClick?: (actionClick: ActionClick) => any;
    onHide?: (modalFunction: ModalFunc) => any;
    modalFunc?: ModalFunc;
    props?: any;
    className?: string;
}

export default function BgsModalConfirmation({ title, ...propsModal }: ModalConfirmation) {
    modal({
        width: 320,
        minHeight: 167,
        ...propsModal,
        className: `bgs-mainmodal-confirmation ${propsModal?.className || ""}`,
        render: (props) => {
            return propsModal.render ? propsModal.render(props) : <ContentConfirmation title={title} {...propsModal} modalFunc={props} />
        }
    })
}
