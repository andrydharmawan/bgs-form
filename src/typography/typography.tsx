import { Variant } from "@mui/material/styles/createTypography";
import { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { PropsWithChildren } from "react";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

interface TypographyModel {
    loading?: boolean;
    text?: any;
    variant?: Variant;
    className?: string;
    sx?: SxProps;
    noWrap?: boolean;
    showTitle?: boolean;
    skeletonHeight?: number | string;
}

const BgsTypography = (props: PropsWithChildren<TypographyModel>) => {
    const { loading = false, text = "", skeletonHeight = 44, showTitle, ...others } = props;

    return <Tooltip title={showTitle ? text : ""} disableHoverListener={!showTitle}>
        <Typography {...others}>
            {loading ? <Skeleton className={others.className}></Skeleton> : (text || props.children)}
        </Typography>
    </Tooltip>
}
export default BgsTypography;