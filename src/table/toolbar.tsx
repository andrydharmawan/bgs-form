import React, { PropsWithChildren, useRef, forwardRef, ForwardedRef, useImperativeHandle, useEffect, useState } from 'react';
import FormModel, { FormGroupModel, FormRef } from "../models/form.model";
import { isArray } from "../lib";
import BgsButtonGroup from "../form/buttongroup";
import SearchIcon from '@mui/icons-material/Search';
import CachedIcon from '@mui/icons-material/Cached';
import { Box, Checkbox, Grid, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import Menu from '@mui/material/Menu';
import BgsGroupForm from "../form/group";
import BgsInput from "../form/input";
import BgsTypography from "../typography/typography";
import { BgsTableToolbarProps } from "../models/table.model";
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { styled } from '@mui/material/styles';
import Badge, { BadgeProps } from '@mui/material/Badge';
import BgsSpinner from "../form/spinner";
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import BgsForm from "../form/form";
import BgsButton from "../form/button";
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';

export interface BgsTableToolbarRef {
    updateData: (data: any) => any;
    reset: (field: string) => any;
}

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: -13,
        top: 9,
        border: `2px solid ${theme.palette.background.paper}`,
        padding: '7px 8px !important',
    },
}));

const BgsTableToolbar = forwardRef(({
    allowSearching = false,
    allowSearchingOptions = false,
    allowRefreshing = false,
    title,
    setPageState,
    setCriteriaState,
    columnSearch,
    columnSetSearch,
    setColumnSetSearch,
    setIsFirstLoad,
    refresh,
    criteriaText,
    loadingState,
    allowSortingOptions,
    columnSort,
    sortState,
    setSortState,
    toolbar,
    openSidebar,
    setOpenSidebar,
    searchFocus
}: PropsWithChildren<BgsTableToolbarProps>, ref: ForwardedRef<BgsTableToolbarRef>) => {
    allowSearching = { fullWidth: false, ...typeof allowSearching === "object" ? allowSearching : {} }

    if (!toolbar.position) toolbar.position = "left";

    if (toolbar?.items?.length > 0) {
        toolbar.items = toolbar.items.map(item => ({
            ...item,
            locateIn: item.locateIn || "beforeSearch"
        }))
    }

    const formRef = useRef<FormRef>(null);

    useImperativeHandle(ref, () => ({
        updateData: data => formRef.current?.updateData(data),
        reset: field => formRef.current?.reset(field)
    }));

    const setSearch = (value: string) => {
        if (value) {
            let criteria: any = {};
            if (isArray(columnSetSearch, 0)) columnSetSearch.forEach(field => {
                criteria[field] = `${value}`;
            })
            setCriteriaState(criteria);
        }
        else {
            setCriteriaState({})
        }
        setIsFirstLoad(true)
        setPageState(1);
    }

    useEffect(() => {
        if (criteriaText) setSearch(criteriaText)
    }, [columnSetSearch])

    let timer: any = null;
    const form: FormGroupModel = {
        item: {
            search: {
                dataField: "search",
                editorOptions: {
                    allowClear: true,
                    onChange: ({ value }) => {
                        clearTimeout(timer)
                        timer = setTimeout(() => {
                            setSearch(value)
                        }, 800);
                    },
                    prefix: loadingState ? <BgsSpinner className="mgl-6" /> : <SearchIcon className="ms-2" />,
                    suffix: <BgsButton visible={allowSearchingOptions && !!allowSearching} title="Search By" variant="icon" onClick={({ event }) => setAnchorEl(event.currentTarget)}><TuneRoundedIcon fontSize="medium" color="action" /></BgsButton>,
                    placeholder: "Search...",
                    className: "bg-white no-label-input"
                }
            }
        }
    }

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [anchorElSort, setAnchorElSort] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleToggle = (dataField: string) => () => {
        const currentIndex = columnSetSearch.indexOf(dataField);
        const newChecked: string[] = [...columnSetSearch];

        if (currentIndex === -1) {
            newChecked.push(dataField);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setColumnSetSearch(newChecked);
    };

    const handleToggleSelectAll = () => {
        if (columnSearch.length === columnSetSearch.length) setColumnSetSearch([]), formRef.current?.reset("search")
        else setColumnSetSearch(columnSearch.map(x => x.dataField))
    };

    const formSortRef = useRef<FormRef>(null);
    const formSort: FormModel = {
        items: [{
            dataField: "sortBy",
            editorOptions: {
                dataSource: columnSort,
                displayExpr: "caption",
                valueExpr: "dataField",
                onChange: ({ value, formRef }) => {
                    const { sortDir } = formRef.getData()
                    setSortState([{
                        field: value,
                        sort: sortDir
                    }])
                }
            },
            editorType: "select"
        }]
    }

    useEffect(() => {
        try {
            if (searchFocus && (allowSearching && !openSidebar)) setTimeout(() => formRef.current?.formControl.setFocus("search"), 300)
        } catch (error) {

        }
    }, [])

    const [click, setClick] = useState<boolean>(false);

    useEffect(() => {
        if (click) setTimeout(() => setClick(false), 350)
    }, [click])

    return (
        <div className="bgs-toolbar">
            {(allowRefreshing || allowSearching || allowSortingOptions) || title ? <div className="w-100 d-flex align-items-center justify-content-between pd-10 min-hg-64">
                {title && <h2 className="p-0 m-0 pe-3 text-secondary text-nowrap title-table">{typeof title === "function" ? title() : title}</h2>}
                <Box className="d-flex align-items-center justify-content-end w-100">
                    {toolbar.items.length > 0 && toolbar.items.filter(x => x.template && x.locateIn === "beforeSearch").map(item => (item.template && item.template()))}
                    <BgsButtonGroup item={{
                        editorOptions: {
                            items: [
                                ...toolbar.position === "left" || !toolbar.position ? toolbar.items.filter(x => !x?.template && x.locateIn === "beforeSearch") : [],
                                {
                                    visible: () => allowRefreshing,
                                    title: "Refresh",
                                    variant: "icon",
                                    suffix: () => <CachedIcon fontSize="medium" color="action" sx={click ? {
                                        animation: "spin .5s linear infinite",
                                        "@keyframes spin": {
                                            "0%": {
                                                transform: "rotate(360deg)",
                                            },
                                            "100%": {
                                                transform: "rotate(0deg)",
                                            },
                                        },
                                    } : {}} />,
                                    onClick: () => (refresh(), setClick(true))
                                }, {
                                    visible: () => allowSortingOptions,
                                    title: "Sorting",
                                    variant: "icon",
                                    suffix: () => <SortByAlphaIcon fontSize="medium" color="action" />,
                                    onClick: ({ event }) => {
                                        setAnchorElSort(event.currentTarget)
                                        setTimeout(() => {
                                            formSortRef.current?.updateData({
                                                sortBy: sortState.length ? sortState[0].field : null,
                                                sortDir: sortState.length ? sortState[0].sort : "asc"
                                            })
                                        })
                                    },
                                }, {
                                    visible: () => allowSearching && allowSearchingOptions,
                                    title: "Advanced Search",
                                    variant: "icon",
                                    suffix: () => <ManageSearchRoundedIcon color="action" />,
                                    onClick: () => setOpenSidebar(!openSidebar)
                                },
                                ...toolbar.position === "right" ? toolbar.items.filter(x => !x?.template) : [],

                                /**, {
                                visible: () => allowSearchingOptions && allowSearching,
                                title: "Search By",
                                variant: "icon",
                                suffix: () => <TuneRoundedIcon fontSize="medium" color="action" />,
                                onClick: ({ event }) => setAnchorEl(event.currentTarget)
                            } */]
                        }
                    }} />
                    {(!allowSearching || openSidebar) && <BgsButtonGroup item={{
                        editorOptions: {
                            items: [
                                ...toolbar.items.length > 0 ? toolbar.items.filter(x => !x?.template && x.locateIn === "afterSearch") : [],
                            ]
                        }
                    }} />}
                    {(!allowSearching || openSidebar) && toolbar.items.length > 0 && toolbar.items.filter(x => x.template && x.locateIn === "afterSearch").map(item => (item.template && item.template()))}

                    <Menu
                        id="long-menu"
                        MenuListProps={{
                            'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorElSort}
                        onClose={() => setAnchorElSort(null)}
                        open={Boolean(anchorElSort)}
                    >
                        <div className="d-flex align-items-center justify-content-between ps-2 pe-3 min-wt-300">
                            <BgsForm {...formSort} ref={formSortRef} className="p-2" />
                            <BgsButton
                                disabled={!sortState.length}
                                title={sortState.length ? (sortState[0].sort === "desc" ? "sorting to asc" : "sorting to desc") : "select sort by first"}
                                variant="icon"
                                className="wt-35 ms-1"
                                onClick={() => {
                                    const data: any = { field: sortState.length ? sortState[0].field : "", sort: sortState.length ? (sortState[0].sort === "asc" ? "desc" : "asc") : "asc" }
                                    setSortState([data])
                                    formSortRef.current?.updateData({
                                        sortDir: data.sort
                                    })
                                }}>
                                <i className={`dx-icon-${sortState.length > 0 ? (sortState[0].sort === "desc" ? "sortdowntext" : "sortuptext") : "sorted"} fs-20`}></i>
                            </BgsButton>
                        </div>
                        {sortState.length > 0 && <div className="d-flex justify-content-start ps-3 pe-3">
                            <BgsButton onClick={() => {
                                setSortState([])
                                formSortRef.current?.reset(["sortBy", "sortDir"])
                            }} variant="text">Clear sorting</BgsButton>
                        </div>}
                    </Menu>
                    {allowSearching && !openSidebar ? <>
                        <BgsGroupForm
                            {...form}
                            className={`no-label-floating ms-2 ${allowSearching.fullWidth ? "w-100" : ""}`}
                            ref={formRef}
                            render={group => <BgsInput name="search" {...group} />}
                        />
                        <BgsButtonGroup item={{
                            editorOptions: {
                                items: [
                                    ...toolbar.items.length > 0 ? toolbar.items.filter(x => !x?.template && x.locateIn === "afterSearch") : [],
                                ]
                            }
                        }} />
                        {toolbar.items.length > 0 && toolbar.items.filter(x => x.template && x.locateIn === "afterSearch").map(item => (item.template && item.template()))}
                        <Menu
                            id="long-menu"
                            MenuListProps={{
                                'aria-labelledby': 'long-button',
                            }}
                            anchorEl={anchorEl}
                            onClose={() => setAnchorEl(null)}
                            open={open}
                        >
                            <BgsTypography className="text-secondary fs-12 ms-3"><StyledBadge color="primary" badgeContent={columnSetSearch.length}>Search by :</StyledBadge></BgsTypography>
                            <hr className="m-0 mt-2 mb-2" />
                            <ListItem disablePadding >
                                <ListItemButton role={undefined} onClick={handleToggleSelectAll} dense>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={columnSetSearch.length ? (columnSearch.length === columnSetSearch.length) : !!columnSetSearch.length}
                                            indeterminate={columnSetSearch.length ? (columnSearch.length === columnSetSearch.length ? false : !!columnSearch.length) : !!columnSetSearch.length}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': "select-all" }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText id={"select-all"} primary={<>
                                        {columnSearch.length === columnSetSearch.length ? "Unselect All" : "Select All"}
                                    </>} />
                                </ListItemButton>
                            </ListItem>
                            {columnSearch.map(({ dataField, caption }) => {
                                const labelId = `checkbox-list-label-${dataField}`;

                                return (
                                    <ListItem
                                        key={dataField}
                                        disablePadding
                                    >
                                        <ListItemButton role={undefined} onClick={handleToggle(dataField)} dense>
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={columnSetSearch.indexOf(dataField) !== -1}
                                                    tabIndex={-1}
                                                    disableRipple
                                                    inputProps={{ 'aria-labelledby': labelId }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText id={labelId} primary={caption} />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </Menu>
                    </> : null}
                </Box>
            </div> : null}
        </div>
    );
})

export default BgsTableToolbar;