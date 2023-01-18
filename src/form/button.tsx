import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { PropsWithChildren, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormRef, Items, MenuRef, ModalOptions } from "../models/form.model";
import BgsModalConfirmation, { ModalConfirmation } from "../modal/modalconfirmation";
import Tooltip from "@mui/material/Tooltip";
import { SxProps } from "@mui/material/styles";
import Skeleton from "@mui/material/Skeleton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import React from "react";
import bgsConfigureStore, { ConfigureStore } from "../store";
import CircularProgress from "@mui/material/CircularProgress";

interface ActionDefaultButton {
    loading: (value: boolean) => any;
    event: React.MouseEvent<HTMLElement>;
    modalRef: ModalRef;
    menuRef: MenuRef;
}

interface ModalRef {
    hide: Function;
    closeOnOutsideDisabled: (value: boolean) => any;
}

interface PropsFormButton {
    item?: Items;
    formControl?: UseFormReturn;
    indexKey?: number;
    formRef?: FormRef;
    disabled?: boolean;
    onClick?: (e: ActionDefaultButton) => any;
    size?: 'small' | 'medium' | 'large';
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" | undefined;
    variant?: 'text' | 'outlined' | 'contained' | 'icon';
    type?: string | "submit" | "button";
    suffix?: any;
    prefix?: any;
    visible?: boolean | Function;
    className?: string;
    to?: string;
    actionType?: "modal" | "menu";
    loading?: boolean;
    title?: string;
    withoutParentDisabled?: boolean;
    sx?: SxProps;
    skeleton?: boolean;
    menuOptions?: MenuOptions;
    modalOptions?: ModalConfirmation;
    visibleLoading?: boolean;
    actionCode?: string;
    menuCode?: string;
}

interface MenuOptions {
    items: MenuOptionsItems[];
    className?: string;
}

interface MenuOptionsItems {
    text?: string;
    onClick?: (e: ActionDefaultButton) => any;
    className?: string;
    disabled?: boolean;
    suffix?: string | Function;
    prefix?: string | Function;
    visible?: boolean;
    to?: string;
    actionType?: "modal" | "menu";
    actionCode?: string;
    menuOptions?: MenuOptions;
    modalOptions?: ModalConfirmation;
}

const BgsButton = ({ menuCode: menuCodeDefault, visibleLoading = true, modalOptions: modalOptionsDefault, menuOptions: menuOptionsDefault, skeleton, sx: sxDefault, title: titleDefault, withoutParentDisabled: withoutParentDisabledDefault, loading: loadingDefault, actionType: actionTypeDefault, to: toDefault, className: classNameDefault, item, formControl, formRef, children, disabled: disabledDefault, onClick: onClickDefault = () => { }, color: colorDefault, size: sizeDefault, variant: variantDefault, type: typeDefault, suffix: suffixDefault, prefix: prefixDefault, visible: visibleDefault, actionCode }: PropsWithChildren<PropsFormButton>): any => {
    const { accessRoles = [], menu }: ConfigureStore = bgsConfigureStore.getState();
    // console.log(accessRoles, actionCode, "accessRoles-button")

    if (menuCodeDefault && actionCode) {
        const data = menu.find(x => x.menuCode === menuCodeDefault && x.details.map(y => y.functionCode).includes(actionCode));
        if (!data?.details.map(x => x.functionCode).includes(actionCode)) return;
    }
    else {
        if (actionCode) if (!accessRoles.includes(actionCode)) return;
    }

    const { editorOptions } = item || {};
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    let {
        onClick = onClickDefault,
        text = "",
        className = classNameDefault,
        disabled = disabledDefault,
        size = sizeDefault || "medium",
        color = colorDefault,
        variant = variantDefault || "contained",
        type = typeDefault || "button",
        suffix = suffixDefault,
        prefix = prefixDefault,
        visible = typeof visibleDefault === "undefined" ? true : visibleDefault,
        to = toDefault,
        actionType = actionTypeDefault,
        loading = loadingDefault || false,
        title = titleDefault,
        withoutParentDisabled = withoutParentDisabledDefault || false,
        sx = sxDefault,
        menuOptions = menuOptionsDefault,
        modalOptions = modalOptionsDefault
    } = editorOptions || {};

    const [loadingState, setLoadingState] = useState<boolean>(loading)
    const [loadingStateMenu, setLoadingStateMenu] = useState<number[]>([]);
    const [menuOutsideClose, setMenuOutsideClose] = useState<boolean>(true)

    const clickDefault = (event: React.MouseEvent<HTMLElement>) => {
        if (actionType === "modal") {
            BgsModalConfirmation({
                props: formRef,
                ...modalOptions,
                onClick: (e) => onClick({
                    event,
                    loading: (value) => loadingAction(value),
                    ...e as any,
                    formRef: formRef as any
                }, formRef as any)
            })
        }
        else if (actionType === "menu") {
            setAnchorEl(event.currentTarget);
        }
        else onClick({
            event,
            loading: (value) => loadingAction(value),
            modalRef: null as any,
            formRef: formRef as any,
            menuRef: {
                hide: () => handleMenuClose(),
                closeOnOutsideDisabled: (value) => setMenuOutsideClose(value)
            },
        }, formRef as any)
    }

    const clickMenuItems = (event: React.MouseEvent<HTMLElement>, { to, actionType, onClick = () => { }, modalOptions }: MenuOptionsItems, index: number) => {
        let onClickAny: any = onClick;
        if (actionType === "modal") {
            handleMenuClose();
            BgsModalConfirmation({
                props: formRef,
                ...modalOptions,
                onClick: (e) => onClickAny({
                    event,
                    loading: (value: any) => setLoadingStateMenu(value ? [...loadingStateMenu, index] : loadingStateMenu.filter(x => x !== index)),
                    ...e as any,
                    formRef: formRef as any
                }, formRef as any) as any
            })
        }
        else if (actionType === "menu") {
            setAnchorEl(event.currentTarget);
        }
        else onClickAny({
            event,
            loading: (value: any) => {
                setLoadingStateMenu(value ? [...loadingStateMenu, index] : loadingStateMenu.filter(x => x !== index))
                setMenuOutsideClose(!value)
            },
            modalRef: null as any,
            formRef: formRef as any,
            menuRef: {
                hide: () => handleMenuClose(),
                closeOnOutsideDisabled: (value: any) => setMenuOutsideClose(value)
            }
        }, formRef as any)
    }

    const loadingAction = (value: boolean) => {
        setLoadingState(value)
    }

    const handleMenuClose = () => {
        if (menuOutsideClose) setAnchorEl(null);
    };

    useEffect(() => {
        setLoadingState(loading)
    }, [loading])

    if (typeof suffix === "function") suffix = suffix({ item, formControl });

    if (typeof prefix === "function") prefix = prefix({ item, formControl });

    if (typeof visible === "function") visible = visible();

    if (!visible) return null;

    if (typeof text === "function") text = text();

    if (withoutParentDisabled) disabled = false;

    const MenuComponent = <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        className={menuOptions?.className || ""}
    >
        {menuOptions?.items.map((props, index) => {
            const { text, suffix = () => { }, prefix = () => { }, actionCode, className = "" } = props;
            if (actionCode) if (!accessRoles.includes(actionCode)) return;
            return <MenuItem className={className} disabled={loadingStateMenu.includes(index)} key={index} onClick={e => clickMenuItems(e, props as any, index)}>{loadingStateMenu.includes(index) ? <CircularProgress size={20} color="inherit" /> : null} {typeof prefix === "function" ? prefix() : prefix} {text} {typeof suffix === "function" ? suffix() : suffix}</MenuItem>
        })}
    </Menu>

    const TemplateButton = () => <>
        {prefix}{children || text}{suffix}
    </>

    if (variant === "icon") {
        return <Tooltip title={title || text} disableHoverListener={title ? false : true}>
            <span className={className?.includes("w-100") ? "w-100" : ""}>
                {skeleton && loading
                    ? <Skeleton className={className} />
                    : <IconButton
                        type={type as any}
                        color={color}
                        size={size}
                        disabled={disabled || loadingState}
                        onClick={clickDefault}
                        className={className}
                        sx={sx}
                    >
                        {loadingState ? <CircularProgress size={20} color="inherit" /> : null}
                        {!visibleLoading ? !loadingState && <TemplateButton /> : <TemplateButton />}
                    </IconButton>}
                {MenuComponent}
            </span>
        </Tooltip>
    }
    else return <Tooltip title={title || text} disableHoverListener={title ? false : true}>
        <span className={className?.includes("w-100") ? "w-100" : ""}>
            {skeleton && loading
                ? <Skeleton className={className} />
                : <Button
                    type={type as any}
                    color={color}
                    size={size}
                    variant={variant}
                    disabled={disabled || loadingState}
                    onClick={clickDefault}
                    className={className}
                    sx={sx}
                >
                    {loadingState ? <CircularProgress size={20} color="inherit" /> : null}
                    {!visibleLoading ? !loadingState && <TemplateButton /> : <TemplateButton />}
                </Button>}
            {MenuComponent}
        </span>
    </Tooltip>
}

export default BgsButton;