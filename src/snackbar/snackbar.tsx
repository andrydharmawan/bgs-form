import ReactDOM from "react-dom";
import { v4 } from "uuid"
import Snackbar from "@mui/material/Snackbar";
import React from "react";
import { createRoot } from 'react-dom/client';

let element: ModalProps[] = [];

export interface SnackbarFunc {
    hide: Function;
}

export interface SnackbarModel {
    message?: string;
    duration?: number;
    action?: (e: SnackbarFunc) => void;
    render?: (e: SnackbarFunc) => void;
    vertical?: 'top' | 'bottom';
    horizontal?: 'left' | 'center' | 'right';
}

interface ModalProps {
    key: string;
    children?: Function;
    open: boolean;
    message: string;
    duration?: number;
    action?: (e: SnackbarFunc) => void;
    element?: any;
    vertical?: 'top' | 'bottom';
    horizontal?: 'left' | 'center' | 'right';
}

const hide = (key: string) => {
    const findIndex = element.findIndex(x => x.key === key)
    if (!element[findIndex] || findIndex === -1) return;
    element[findIndex].open = false;
    component();

    setTimeout(() => {
        element.splice(findIndex, 1)
        component();
    })
};

export default function bgsSnackbar({
    render: children,
    message = "",
    duration = 6000,
    action,
    vertical = "bottom",
    horizontal = "left"
}: SnackbarModel): SnackbarFunc {
    if (!document.getElementById("bgs-snackbar")) {
        let elemDiv = document.createElement('div');
        elemDiv.id = "bgs-snackbar";
        document.body.appendChild(elemDiv);
    }

    let { key }: any = element.find(x => x.message === message) || {};

    const container = document.getElementById('bgs-snackbar');
    const root = createRoot(container!)
    if (!key) {
        key = v4()
        element.push({
            key,
            open: true,
            children,
            message,
            duration,
            action,
            element: root,
            vertical,
            horizontal
        })

        component();
    }

    return {
        hide: () => hide(key)
    }
};

const component = () => {
    element.map(({
        key,
        open,
        message,
        action,
        children,
        element,
        vertical = "bottom",
        horizontal = "left"
    }) => element.render(
        children
            ? <Snackbar
                key={key}
                open={open}
                autoHideDuration={2000}
                onClose={() => hide(key)}
                message={message}
                action={action as any}
                anchorOrigin={{ vertical, horizontal }}
                className="bgs-snackbar"
            >{children ? children({ hide: () => hide(key) }) : null}</Snackbar>
            : <Snackbar
                key={key}
                open={open}
                autoHideDuration={2000}
                onClose={() => hide(key)}
                message={message}
                action={action as any}
                className="bgs-snackbar"
                anchorOrigin={{ vertical, horizontal }}
            />)
    )
}