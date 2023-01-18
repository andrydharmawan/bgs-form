import Skeleton from "@mui/material/Skeleton";
import { PropsForm } from "../models/form.model";
import { getFieldValue, recursiveReMapping, valueDataType } from "../lib";
import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";

// const BgsInput = lazy(() => import('./input'));
// const BgsSelect = lazy(() => import('./select'));
// const BgsButton = lazy(() => import('./button'));
// const BgsTextarea = lazy(() => import('./input'));
// const BgsCheckbox = lazy(() => import('./checkbox'));
// const BgsCheckboxGroup = lazy(() => import('./checkboxgroup'));
// const BgsRadioButton = lazy(() => import('./radiobutton'));
// const BgsDate = lazy(() => import('./date'));
// const BgsButtonGroup = lazy(() => import('./buttongroup'));
// const BgsSwitch = lazy(() => import('./switch'));

import BgsInput from "./input";
import BgsSelect from "./select"
import BgsButton from "./button"
import BgsTextarea from "./input"
import BgsCheckbox from "./checkbox"
import BgsCheckboxGroup from "./checkboxgroup"
import BgsRadioButton from "./radiobutton"
import BgsDate from "./date"
import BgsButtonGroup from "./buttongroup"
import BgsSwitch from "./switch"
import BgsLabel from "./label"
import BgsUpload from "./upload"
import BgsAutoComplete from "./autocomplete"
import BgsTemplate from "./template"
import BgsSummaryValidation from "./summaryvalidation"


const BgsComponentForm = forwardRef(({
    name,
    item,
    formControl,
    formRef,
    apperance,
    loading,
    group,
    spacing,
    showLabelShrink,
    showIcon,
    ...others
}: PropsForm, ref: any) => {
    if (name) {
        const { disabled, readOnly }: any = others || {};
        item = recursiveReMapping(formRef, disabled, readOnly, item[name] as any)
        useImperativeHandle(ref, () => {
            return {
                name,
                type: item.editorType,
                item,
                ...formRef
            }
        });
    }

    const [loaded, setLoaded] = useState<boolean>(false)

    useEffect(() => {
        setTimeout(() => setLoaded(true), 200)
    }, [])

    const {
        editorType = "input"
    } = item;

    let BgsComponents = BgsInput;

    switch (editorType) {
        case "switch":
            BgsComponents = BgsSwitch;
            break;
        case "select":
            BgsComponents = BgsSelect;
            break;
        case "button":
            BgsComponents = BgsButton as any;
            break;
        case "buttongroup":
            BgsComponents = BgsButtonGroup as any;
            break;
        case "textarea":
            BgsComponents = BgsTextarea;
            break;
        case "checkbox":
            BgsComponents = BgsCheckbox;
            break;
        case "checkboxgroup":
            BgsComponents = BgsCheckboxGroup;
            break;
        case "radiobutton":
            BgsComponents = BgsRadioButton;
            break;
        case "date":
            BgsComponents = BgsDate;
            break;
        case "template":
            BgsComponents = BgsTemplate;
            break;
        case "number":
            BgsComponents = BgsInput;
            break;
        case "mask":
            BgsComponents = BgsInput;
            break;
        case "upload":
            BgsComponents = BgsUpload;
            break;
        case "label":
            BgsComponents = BgsLabel;
            break;
        case "autocomplete":
            BgsComponents = BgsAutoComplete;
            break;
        case "summaryvalidation":
            BgsComponents = BgsSummaryValidation;
            break;
        default:
            BgsComponents = BgsInput;
            break;
    }

    return <>
        {!loaded ? <Skeleton variant="rectangular" animation="wave" className="w-100 rounded" height={44} /> : null}
        <div className={!loaded ? "d-none" : ""}>
            <BgsComponents item={item} formControl={formControl} formRef={formRef} apperance={apperance} loading={loading} group={group} spacing={spacing} showLabelShrink={showLabelShrink} showIcon={showIcon} />
        </div>
    </>
})

export default BgsComponentForm;