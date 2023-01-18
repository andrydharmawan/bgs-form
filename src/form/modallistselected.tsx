import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import BgsButton from "./button";
import DeleteIcon from '@mui/icons-material/Delete';
import { ModalFunc } from "../modal/modal";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import BgsTypography from "../typography/typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import React from "react";

interface DataSourceModel {
    displayExpr: string;
    valueExpr: string;
    data: any;
}

interface ModalListSelectedProps {
    dataSelected: DataSourceModel[],
    selected: Function,
    onBlur: Function,
    modalOptions: ModalFunc
}

export default function ModalListSelected({ dataSelected, selected, onBlur, modalOptions }: ModalListSelectedProps) {
    const [dataSelectedState, setDataSelectedState] = useState<DataSourceModel[]>(dataSelected || []);
    const [removeData, setRemoveData] = useState<DataSourceModel | null>(null)

    useEffect(() => {
        if(!removeData) return
        setDataSelectedState(dataSelectedState.filter(y => y.valueExpr !== removeData?.valueExpr))
        selected(removeData)
        onBlur()
    }, [removeData])

    return (
        <>
            <div className="pt-2 pb-2 pe-2 ps-4 d-flex align-items-center justify-content-between">
                <Badge badgeContent={dataSelectedState.length} color="primary">
                    <BgsTypography className="fs-18 text-truncate max-wd-20">Data Selected</BgsTypography>
                </Badge>
                <BgsButton onClick={() => modalOptions.hide()} variant="icon"><CloseIcon /></BgsButton>
            </div>
            <Divider />
            <div className="scroll max-hg-400 p-2 mb-2" style={{ overflow: "scroll" }}>
                <List>
                    {dataSelectedState.map((x, index) => <ListItem
                        key={index}
                        secondaryAction={
                            <BgsButton variant="icon" onClick={() => setRemoveData(x)}>
                                <DeleteIcon />
                            </BgsButton>
                        }
                    >
                        <ListItemText primary={x.displayExpr} />
                    </ListItem>)}
                </List>
                {!dataSelectedState.length ? <Box className="MuiDataGrid-overlay d-flex align-items-center justify-content-center flex-column w-100 hg-150">
                    <svg width="100" height="50" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                            <ellipse fill="#F5F5F5" cx="32" cy="33" rx="32" ry="7"></ellipse>
                            <g fillRule="nonzero" stroke="#D9D9D9">
                                <path
                                    d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z">
                                </path>
                                <path
                                    d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                                    fill="#FAFAFA"></path>
                            </g>
                        </g>
                    </svg>
                    <Box sx={{ color: "#D9D9D9" }}>No Data</Box>
                </Box> : null}
            </div>
        </>
    )
}