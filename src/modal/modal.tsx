
import React from "react";
// import { createRoot } from 'react-dom/client';
import Modal from "@mui/material/Modal";
import { v4 } from "uuid"
import Box from '@mui/material/Box';
import { ThemeProvider, Typography } from "@mui/material";
import theme from "../config/theme";
import { StrictMode } from "react";
var element: ModalProps[] = [];

export interface ModalFunc {
    hide: Function;
    closeOnOutsideDisabled: Function;
}

export interface ModalModel {
    render: (e: ModalFunc) => void;
    title?: string;
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
    name?: string;
}

interface ModalProps {
    key: string;
    children: Function;
    open: boolean;
    title?: string;
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
    name?: string;
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

export default function bgsModal({
    title,
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
    name
}: ModalModel): ModalFunc {
    const key = v4()

    element.push({
        key,
        open: true,
        children,
        title,
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
        isBlur,
        name
    })

    component();

    return {
        hide: () => hide(key),
        closeOnOutsideDisabled: () => closeOnOutsideDisabled(key)
    }
};

export function clearModal() {
    element = element.map(item => {
        item.open = false;
        return item
    });
    component();
}

interface ModalRef {
    isOpen: boolean;
}

export function modalRef(name: string) {
    const find = element.find(x => x?.name === name);

    return {
        option: (key?: "hide" | "closeOnOutsideDisabled" | "isOpen"): ModalRef | null | undefined => {

            const result: any = {
                isOpen: !!find
            }

            if (key) return result[key];

            return result;
        },
        hide: () => {
            if (find?.key) hide(find?.key)
        },
        closeOnOutsideDisabled: () => {
            if (find?.key) closeOnOutsideDisabled(find?.key)
        },
    }
}

export function getComponentModal() {
    return element
}

const component = () => {
    element.map(({
        key,
        open,
        children,
        width,
        title,
        minWidth,
        maxWidth,
        height,
        minHeight,
        maxHeight,
        closeOnOutside,
        className,
        element,
        isBlur,
        name
    }) => {
        element.render(<StrictMode>
            <ThemeProvider theme={theme}>
                <Modal
                    key={key}
                    open={open}
                    onClose={closeOnOutside ? () => hide(key) : () => { }}
                    className={isBlur ? "bg-blur" : ""}
                >
                    <Box key={name} className={`bgs-modal ${className}`} sx={{ width, minWidth, maxWidth, height, minHeight, maxHeight }}>
                        {title ? <Typography className="p-2 ps-3 pe-3" variant="h6" component="h2">
                            {title}
                        </Typography> : null}
                        {children({ hide: () => hide(key), closeOnOutsideDisabled: () => closeOnOutsideDisabled(key) })}
                    </Box>
                </Modal>
            </ThemeProvider>
        </StrictMode>)
    })
}