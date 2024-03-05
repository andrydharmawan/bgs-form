import TextField from "@mui/material/TextField";
import { Controller } from "react-hook-form";
import { v4 } from "uuid";
import { recursiveReMapping, validationRules } from "../lib";
import React, { useImperativeHandle, ChangeEvent, forwardRef, useState, useEffect } from "react";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Tooltip from "@mui/material/Tooltip";
import bgsSnackbar from "../snackbar/snackbar";
import Slide from "@mui/material/Slide";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Alert from "@mui/material/Alert";
import { PropsForm, ResponseModel } from "../models/models";
import BgsButtonGroup from "./buttongroup";
import { BgsLabel } from "./input";
import BgsButton from "./button";
import bgsModalConfirmation from "../modal/modalconfirmation";
import BgsSpinner from "./spinner";
import Typography from "@mui/material/Typography";


export interface BgsUploadProps {
    id: string;
    fileExtention: string;
    fileName: string;
    fileSize: number;
    modul?: string;
    originalName: string;
    file?: Blob | File;
}

interface TempFile {
    id: string;
    file?: Blob | File;
    name: string;
    type: string;
    size: number;
    status: "start" | "progress" | "success" | "error";
    progress: number;
    message?: string | null | undefined;
}

const BgsUpload = forwardRef(({
    name,
    item,
    formControl,
    formRef,
    apperance,
    showIcon,
    ...others
}: PropsForm, ref: any) => {
    const [key, setKey] = useState<string>(v4());
    const [listFileTemp, setListFileTemp] = useState<TempFile[]>([]);

    if (name) {
        const { disabled, readOnly }: any = others || {};
        item = recursiveReMapping(formRef, disabled, readOnly, item[name] as any)
        useImperativeHandle(ref, () => {
            return {
                name,
                type: item.editorType,
                item,
                ...formRef
            }
        });
    }

    const { control, setValue, trigger } = formControl;

    const {
        label,
        editorOptions,
        dataField = v4(),
        validationRules: validation = [],
        editorType,
        visible: visibleItem
    } = item;
    const labelVisible = typeof label?.visible === "undefined" ? true : label?.visible;
    let {
        disabled,
        readOnly,
        visible = visibleItem,
        onChange: onChangeItem = () => { },
        helper,
        beforeUpload,
        afterUpload,
        maxFile = 1,
        onDelete = () => true,
        accept = "",
        maxSize = 0,
        allowDeleting = true,
        items: itemsItem = [],
        iconUpload,
        iconRemoveUpload
    } = editorOptions || {};

    useEffect(() => {
        if (listFileTemp.length) listFileTemp.filter(x => x.status === "start").forEach(x => upload(x))
    }, [listFileTemp])

    const upload = async ({ file, name, size, id, type }: TempFile) => {
        const findIndex = listFileTemp.findIndex(x => x.id === id);
        listFileTemp[findIndex].status = "progress";
        setListFileTemp(listFileTemp)
        setKey(v4())
        if (typeof helper !== "function") return;

        if (accept) {
            if (!accept.replace(/\s/g, '').split(",").includes(`.${name.split('.').pop()}`)) {
                if (findIndex !== -1) {
                    listFileTemp[findIndex].message = `Type file not allowed`;
                    listFileTemp[findIndex].status = "error";
                }
                setListFileTemp(listFileTemp)
                setKey(v4())
                return;
            }
        }

        if (maxSize) {
            const isLt2M = size / 1024 / 1024 > maxSize;
            if (maxSize && isLt2M) {
                if (findIndex !== -1) {
                    listFileTemp[findIndex].message = `Max file size ${maxSize}MB`;
                    listFileTemp[findIndex].status = "error";
                }
                setListFileTemp(listFileTemp)
                setKey(v4())
                return;
            }
        }

        const param: any = typeof beforeUpload === "function" ? beforeUpload({ file, name, size, type }, formRef) : {};

        const { status, data = [], message, ...others }: ResponseModel = await helper({
            file,
            ...param
        }, undefined, {
            // @ts-ignore
            onUploadProgress: (e: any) => {
                // if (findIndex !== -1) listFileTemp[findIndex].progress = Math.ceil((e.loaded / e.total) * 100);
                // setListFileTemp(listFileTemp)
                // setKey(v4())
            }
        });


        if (typeof afterUpload === "function" && afterUpload) afterUpload({ status, data, message, ...others })

        if (findIndex !== -1) {
            listFileTemp[findIndex].progress = 100;
            listFileTemp[findIndex].status = status ? "success" : "error";
            listFileTemp[findIndex].message = status ? null : message;
            setListFileTemp(listFileTemp)
            setKey(v4())
        }

        if (status) {
            const value = formRef.getData(dataField) || [];
            setValue(dataField, [...value, ...data.length ? data : []]);
        }

        await trigger(dataField);

        onChangeItem({
            value: status ? (data.length ? data[0] : null) : null,
            formRef,
            data: null
        });
    }

    const removeFile = (data: any, index: number) => {
        if (!onDelete(data, index)) return;

        bgsModalConfirmation({
            onClick: modal => {
                const value = formRef.getData(dataField) || [];
                value.splice(index, 1)
                setValue(dataField, value);

                trigger(dataField);
                modal.modalRef.hide();
            }
        })
    }

    const readFileAndAddToMap = (obj: any) => {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = (e: any) => {
                const { name, type, size } = obj;
                const fileBlob = new Blob([e.target.result], { type });
                const file = new File([fileBlob], name);
                resolve({
                    name, type, size, file
                });
            }

            reader.onerror = function (error) {
                reject(error);
            }

            reader.readAsArrayBuffer(obj);
        });
    }

    const onChangeDefault = async (event: ChangeEvent<HTMLInputElement>) => {
        const { files = [] } = event.target;
        const value = formRef.getData(dataField) || [];

        if ((files?.length || 0) > maxFile - value.length) {
            bgsSnackbar({ message: `Max File upload ${maxFile}` })
            setKey(v4())
            return;
        }

        if (files) {
            let filePromise: any = [];
            for (let index = 0; index < files.length; index++) {
                filePromise.push(readFileAndAddToMap(files[index]))
            }
            const fileData: TempFile[] = await Promise.all(filePromise).then((result) => result) as any;
            if (maxFile === 1) {
                const valueBefore = formRef.getData(dataField) || [];
                const callback = () => {
                    setValue(dataField, []);
                    const { file, name, type, size } = fileData[0];
                    if (typeof helper === "function") {
                        setListFileTemp([{
                            id: v4(),
                            file,
                            name,
                            type,
                            size,
                            status: "start",
                            progress: 0
                        }])
                    }
                    else {
                        const data = [{
                            id: v4(),
                            fileExtention: `.${name.split('.').pop()}`,
                            fileName: name,
                            fileSize: size,
                            originalName: name,
                            file
                        }];

                        if (accept) {
                            if (!accept.replace(/\s/g, '').split(",").includes(`.${name.split('.').pop()}`)) {
                                setListFileTemp([{
                                    id: v4(),
                                    file,
                                    name,
                                    type,
                                    size,
                                    status: "error",
                                    progress: 0,
                                    message: "Type file not allowed"
                                }])
                                setKey(v4())
                                return;
                            }
                        }

                        if (maxSize) {
                            const isLt2M = size / 1024 / 1024 > maxSize;
                            if (maxSize && isLt2M) {
                                setListFileTemp([{
                                    id: v4(),
                                    file,
                                    name,
                                    type,
                                    size,
                                    status: "error",
                                    progress: 0,
                                    message: `Max file size ${maxSize}MB`
                                }])
                                setKey(v4())
                                return;
                            }
                        }

                        setValue(dataField, data);
                        onChangeItem({
                            value: data[0],
                            formRef,
                            data: null
                        });
                    }
                }
                if (valueBefore.length) bgsModalConfirmation({
                    message: "Are you sure want to replace file?",
                    onClick: modal => {
                        callback();
                        modal.modalRef.hide();
                    }
                })
                else {
                    callback();
                }
            }
            else {
                if (typeof helper === "function") {
                    const data: TempFile[] = fileData.map(({ file, name, type, size }) => {
                        return {
                            id: v4(),
                            file,
                            name,
                            type,
                            size,
                            status: "start",
                            progress: 0
                        }
                    })
                    setListFileTemp([...listFileTemp, ...data])
                }
                else {
                    const valueBefore = formRef.getData(dataField) || [];
                    let data: BgsUploadProps[] = [];
                    let dataTemp: TempFile[] = [];
                    fileData.map(({ file, name, type, size }) => {
                        if (accept) {
                            if (!accept.replace(/\s/g, '').split(",").includes(`.${name.split('.').pop()}`)) {
                                dataTemp.push({
                                    id: v4(),
                                    file,
                                    name,
                                    type,
                                    size,
                                    status: "error",
                                    progress: 0,
                                    message: "Type file not allowed"
                                })
                                return;
                            }
                        }
                        if (maxSize) {
                            const isLt2M = size / 1024 / 1024 > maxSize;
                            if (maxSize && isLt2M) {
                                dataTemp.push({
                                    id: v4(),
                                    file,
                                    name,
                                    type,
                                    size,
                                    status: "error",
                                    progress: 0,
                                    message: `Max file size ${maxSize}MB`
                                })
                                return;
                            }
                        }

                        data.push({
                            id: v4(),
                            file,
                            fileName: name,
                            fileExtention: `.${name.split('.').pop()}`,
                            originalName: name,
                            fileSize: size,
                        })
                    })

                    setValue(dataField, [...valueBefore, ...data]);
                    setListFileTemp([...listFileTemp, ...dataTemp])

                    onChangeItem({
                        value: [...valueBefore, ...data],
                        formRef,
                        data: null
                    });
                }
            }
        }
    }

    const deleteListFileTemp = (data: TempFile) => {
        setListFileTemp(listFileTemp.filter(x => x.id !== data.id))
        setKey(v4())
    }

    return <Controller
        name={dataField}
        control={control}
        rules={!visible || disabled || readOnly ? {} : validationRules(validation, item, formControl, formRef)}
        render={({
            field: { ref, value = [] },
            fieldState: { invalid, error },
        }) => (
            <FormControl error={invalid} component="fieldset" variant="standard" className="w-100 bgs-form-upload">
                {labelVisible ? <FormLabel component="legend"><BgsLabel label={label} showIcon={showIcon} validation={validation} editorType={editorType} editorOptions={editorOptions} formControl={formControl} dataField={dataField} /></FormLabel> : null}
                <div className={`bgs-container-upload position-relative w-100 ${disabled || readOnly ? "grayscale bg-grey-100" : ""}`}>
                    <div className="d-flex align-items-center p-3 ps-4 pe-4 br-10 w-100">
                        <CloudUploadOutlinedIcon className="text-secondary fs-30 bgs-icon-upload" />
                        <div className="ms-3 bgs-container-label-upload">
                            <Typography className="lh-18 fs-15 bgs-label-upload">Drop files to attach, or <span className="c-blue-300">browse</span></Typography>
                            <Typography className="lh-18 fs-13 bgs-desc-upload text-secondary">{accept ? <span>Only <b>{accept}</b> files</span> : null} {maxSize ? <span>, Max size <b>{maxSize}MB</b></span> : null}</Typography>
                        </div>
                    </div>
                    <TextField
                        key={key}
                        type="file"
                        inputRef={ref}
                        value={undefined}
                        fullWidth
                        variant={apperance}
                        size="small"
                        className={`bgs-${editorType}`}
                        onChange={onChangeDefault}
                        error={invalid}
                        disabled={disabled}
                        InputProps={{
                            inputProps: {
                                multiple: maxFile > 1,
                                accept,
                                title: " "
                            },
                            className: `${editorOptions?.className}`,
                            readOnly
                        }}
                    />
                </div>
                <div className="list-content-upload">
                    <div key={key} style={{ overflow: "hidden" }} className="mt-2">
                        {listFileTemp.filter(x => x.status !== "success").map((data, index) => <Tooltip key={index} title={data.message || ""}>
                            <Alert
                                action={<BgsButton onClick={() => deleteListFileTemp(data)} variant="icon" color="error">{iconRemoveUpload ? iconRemoveUpload(data as any) : <DeleteOutlineIcon className="fs-18" />}</BgsButton>}
                                className="br-10 mb-2 list-file-upload file-error"
                                severity={data.status === "progress" || data.status === "start" ? "info" : data.status}
                                icon={data.status === "progress" ? <BgsSpinner size={18} /> : (data.status === "success" ? <CheckCircleOutlineOutlinedIcon color="success" /> : <ErrorOutlineOutlinedIcon color="error" />)}
                            >
                                {data.name}
                                {/* {data.status === "progress" ? <LinearProgress variant="determinate" value={data.progress} /> : null} */}
                            </Alert>
                        </Tooltip>)}
                    </div>
                    {value.map((data: any, index: number) => {
                        const props = {
                            data,
                            rowIndex: index,
                        };

                        let items: any = itemsItem?.map(({
                            onClick = () => { },
                            visible,
                            actionType,
                            menuOptions,
                            ...otherProps
                        }) => {
                            if (typeof visible === "function") visible = visible(props as any);

                            return {
                                ...otherProps,
                                visible,
                                actionType,
                                onClick: (e: any) => onClick({
                                    ...props as any,
                                    ...e as any
                                }, formRef),
                                ...actionType === "menu" ? {
                                    menuOptions: {
                                        ...menuOptions,
                                        items: menuOptions?.items.map(x => {
                                            let { visible = () => true, onClick: click = () => { } }: any = x;
                                            if (typeof visible === "function" && visible !== undefined) visible = visible(props as any)

                                            return {
                                                ...x,
                                                visible,
                                                ...click !== undefined && typeof click === "function" ? {
                                                    onClick: (e: any) => click({
                                                        ...props as any,
                                                        ...e as any
                                                    }, formRef)
                                                } : null
                                            }
                                        }).filter(x => x.visible)
                                    }
                                } : null
                            }
                        })

                        if (!disabled && !readOnly) {
                            if (allowDeleting) items.push({
                                onClick: () => removeFile(data, index),
                                prefix: () => iconRemoveUpload ? iconRemoveUpload(data) : <DeleteOutlineIcon className="fs-18" />,
                                variant: "icon",
                                color: "error"
                            })
                        }

                        return <div key={index} className="w-100">
                            <Slide in={true} direction="up">
                                <Alert
                                    action={<BgsButtonGroup item={{
                                        editorOptions: {
                                            items
                                        }
                                    }} />}
                                    className="br-10 mb-2 list-file-upload" severity={"success"}
                                    icon={iconUpload ? iconUpload(data) : <AttachFileIcon color="success" sx={{ transform: "rotate(50deg)" }} />}
                                >{data.originalName}</Alert>
                            </Slide>
                        </div>
                    })}
                </div>
                <FormHelperText>{error?.message || label?.hint}</FormHelperText>
            </FormControl>
        )}
    />
})
export default BgsUpload;