import { Items, PropsForm } from "../models/form.model";
import React, { forwardRef, Children } from "react";

const BgsSummaryValidation = forwardRef(({
    formControl,
    group
}: PropsForm) => {
    const findDataField = (itms: Items[]): any => {
        let fieldsOnGroup: string[] = [];
        itms.forEach(im => {
            if (im) {
                if (im.itemType === "group") {
                    if (im.name) fieldsOnGroup.push(im.name)
                    fieldsOnGroup = [...fieldsOnGroup, ...findDataField(im.items as Items[])]
                }
                else {
                    if (typeof im === "string") {
                        const fld = (im as any)?.split("|");
                        fieldsOnGroup.push(fld.length ? fld[0] : im)
                    }
                    else {
                        if (im.dataField) fieldsOnGroup.push(im.dataField)
                    }
                }
            }
        })
        return fieldsOnGroup
    }

    const findDataFieldOnGroup = (field: string) => {
        let result = null;
        if (group) {
            let itemData: any = {};
            Object.keys(group).forEach(name => {
                if (name) {
                    if (typeof group[name] !== "string") {
                        const im: any = group[name] || {}
                        itemData = {
                            ...itemData,
                            [name || ""]: im.dataField && !im.items ? [im.dataField] : findDataField(im.items)
                        };
                    }
                }

            })
            Object.keys(itemData).forEach(key => {
                if (itemData[key].includes(field)) result = key;
            })
        }
        return result;
    }

    return <>
        <div id="summary" className="dx-validationsummary dx-widget dx-collection">
            {Children.toArray(Object.keys(formControl.formState.errors).map(field => <div className="dx-item dx-validationsummary-item" onClick={() => {
                try {
                    const find: any = findDataFieldOnGroup(field)
                    if (find && group && group[find]) if ((group[find] as any)?.setFocus) (group[find] as any)?.setFocus()
                    setTimeout(() => formControl.formState.errors[field].ref?.focus())
                } catch (error) {

                }
            }}>
                <div className="dx-item-content dx-validationsummary-item-content">{formControl.formState.errors[field].message}</div>
            </div>))}
        </div>
    </>
})
export default BgsSummaryValidation;