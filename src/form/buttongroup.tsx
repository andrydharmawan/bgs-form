import { horizontalAlignmentClass, verticalAlignmentClass } from "../lib";
import { PropsWithChildren } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormRef, Items } from "../models/form.model";
import BgsButton from "./button";
import React from "react";
interface PropsFormButton {
    item?: Items;
    formControl?: UseFormReturn;
    formRef?: FormRef;
    menuCode?: string;
}

const BgsButtonGroup = ({
    item,
    formControl,
    formRef,
    menuCode
}: PropsWithChildren<PropsFormButton>) => {
    const { items = [], aligned = "horizontal", className, horizontalAlignment, verticalAlignment }: any = item?.editorOptions || {};

    return <div className={`button-group d-flex ${horizontalAlignmentClass(horizontalAlignment)} ${verticalAlignmentClass(verticalAlignment)} ${aligned === "horizontal" ? "flex-row" : "flex-column"} ${className}`}>
        {items.map((item: any, index: number) => {
            const { visible = true, ...others } = item || {};
            // console.log(others, "others------")

            return <span key={index} className={`d-flex align-items-center`}>
                <BgsButton menuCode={menuCode} item={{ editorOptions: { ...others, visible } }} formControl={formControl} formRef={formRef} actionCode={others.actionCode} />
            </span>
        })}
    </div>
}

export default BgsButtonGroup;