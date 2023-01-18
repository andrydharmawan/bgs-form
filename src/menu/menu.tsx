
import React from "react";
// import { createRoot } from 'react-dom/client';
import Menu from "@mui/material/Menu";
import { v4 } from "uuid"
import Box from '@mui/material/Box';
import { ThemeProvider } from "@mui/material";
import theme from "../config/theme";
import { StrictMode } from "react";
var element: MenuProps[] = [];
// import { BrowserRouter } from 'react-router-dom';

export interface MenuFunc {
    hide: Function;
    closeOnOutsideDisabled: Function;
}

export interface MenuModel {
    render: (e: MenuFunc) => void;
    anchorEl: HTMLElement;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    height?: number | string;
    minHeight?: number | string;
    maxHeight?: number | string;
    closeOnOutside?: boolean;
    className?: string;
    onHide?: Function;
    isBlur?: boolean;
}

interface MenuProps {
    key: string;
    children: Function;
    anchorEl: HTMLElement;
    open: boolean;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    height?: number | string;
    minHeight?: number | string;
    maxHeight?: number | string;
    closeOnOutside?: boolean;
    className?: string;
    element?: any;
    onHide?: Function;
    isBlur?: boolean;
}

const hide = (key: string) => {
    const findIndex = element.findIndex(x => x.key === key)

    element[findIndex].open = false;
    const { onHide = () => { } } = element[findIndex];
    if (typeof onHide === "function" && onHide) {
        onHide();
    }

    component();

    setTimeout(() => {
        element.splice(findIndex, 1)
        component();
    })
};

const closeOnOutsideDisabled = (key: string) => {
    const findIndex = element.findIndex(x => x.key === key)
    element[findIndex].closeOnOutside = !element[findIndex].closeOnOutside;

    component();
};

export default function bgsMenu({
    render: children,
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight,
    closeOnOutside = true,
    className,
    onHide = () => { },
    isBlur = false,
    anchorEl
}: MenuModel): MenuFunc {
    const key = v4()

    element.push({
        anchorEl,
        key,
        open: true,
        children,
        width,
        minWidth,
        maxWidth,
        height,
        minHeight,
        maxHeight,
        closeOnOutside,
        className,
        element: null,
        // element: createRoot(document.createElement("div")),
        onHide,
        isBlur
    })

    component();

    return {
        hide: () => hide(key),
        closeOnOutsideDisabled: () => closeOnOutsideDisabled(key)
    }
};

export function clearMenu() {
    element = element.map(item => {
        item.open = false;
        return item
    });
    component();
}

const component = () => {
    element.map(({
        key,
        open,
        children,
        width,
        minWidth,
        maxWidth,
        height,
        minHeight,
        maxHeight,
        closeOnOutside,
        className,
        element,
        isBlur,
        anchorEl
    }) => {
        element.render(<StrictMode>
            <ThemeProvider theme={theme}>
                <Menu
                    anchorEl={anchorEl}
                    key={key}
                    open={open}
                    onClose={closeOnOutside ? () => hide(key) : () => { }}
                    className={`${isBlur ? "bg-blur" : ""}`}
                    MenuListProps={{ className: "p-0" }}
                >
                    <Box className={`bgs-menu ${className}`} sx={{ width, minWidth, maxWidth, height, minHeight, maxHeight }}>
                        {children({ hide: () => hide(key), closeOnOutsideDisabled: () => closeOnOutsideDisabled(key) })}
                    </Box>
                </Menu>
            </ThemeProvider>
        </StrictMode>)
    })
}