import { PropsForm } from "../models/form.model";
import BgsComponentForm from "./component";
import React from "react";
import Grid from "@mui/material/Grid";

const BgsLayoutForm = ({ item, formControl, indexKey, formRef, apperance, loading, group, spacing: spacingDefault, showLabelShrink, showIcon }: PropsForm) => {
    const { colCount = 1, className = "", caption, items = [], spacing = spacingDefault } = item;
    const renderComponent = ({ item, formControl, indexKey, formRef }: PropsForm) => {
        switch (item?.itemType) {
            case "group":
                return <BgsLayoutForm item={item} formControl={formControl} indexKey={indexKey} formRef={formRef} apperance={apperance} loading={loading} group={group} spacing={spacing} showLabelShrink={showLabelShrink} showIcon={showIcon} />
            default:
                return <BgsComponentForm item={item} formControl={formControl} formRef={formRef} apperance={apperance} loading={loading} group={group} spacing={spacing} showLabelShrink={showLabelShrink} showIcon={showIcon} />
        }
    }
// @ts-ignore
    const colSpan = (item: any, colCount: any) => {
        const colSpan = Math.round((12 / colCount) * (item?.colSpan || 1));
        return colSpan === 1 ? `col` : `col-${colSpan}`
    }

    return <>
        {caption ? <h4 className="border-bottom w-100 d-block pb-1">{caption}</h4> : null}
        <Grid container columns={colCount} spacing={spacing} className={`${className || ""}`}>
            {items.map((childItem: any, index: number) => {
                const display = childItem?.items?.length && (childItem?.items?.filter((x: any) => typeof x.visible === "boolean" ? !x.visible : true).length === childItem?.items?.length);
                return childItem.visible && !display ? <Grid item key={`${indexKey}-child-${index}`} xs={colCount} md={childItem?.colSpan || 1} className={`${childItem?.className || ""} childchildchildchild`}>
                    {renderComponent({ item: childItem, formControl, indexKey, formRef, group, spacing, showLabelShrink, showIcon })}
                </Grid> : null
            })}
        </Grid>
    </>
}

export default BgsLayoutForm;