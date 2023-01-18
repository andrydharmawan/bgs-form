import CircularProgress, { circularProgressClasses } from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { PropsWithChildren } from "react";
import React from "react";

interface SpinnerLoadingModel{
    size?:number;
    className?: string;
}

export default function BgsSpinner({ size = 24, className = "" }: PropsWithChildren<SpinnerLoadingModel>) {
    return (
        <Box sx={{ position: 'relative', display: "flex", alignItems: "center", marginTop: "3px" }} className={className}>
            <CircularProgress
                variant="determinate"
                sx={{
                    color: (theme) =>
                        theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
                }}
                size={size}
                thickness={4}
                value={100}
            />
            <CircularProgress
                variant="indeterminate"
                disableShrink
                sx={{
                    color: (theme) => (theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8'),
                    animationDuration: '550ms',
                    position: 'absolute',
                    left: 0,
                    [`& .${circularProgressClasses.circle}`]: {
                        strokeLinecap: 'round',
                        stroke: "currentColor",
                        strokeDasharray: "80px,200px",
                        strokeDashoffset: 0
                    },
                }}
                size={size}
                thickness={4}
            />
        </Box>
    );
}