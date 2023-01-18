
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontSize: 13,
        button: {
            textTransform: "none"
        },
        fontFamily: ['inherit'].join(", ")
    },
    components: {
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '& .MuiDataGrid-root': {
                        border: "0px solid #fff !important",

                    },
                    '&:last-child td': {
                        borderBottom: 0,
                    },
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none"
                }
            }
        },
        MuiFilledInput: {
            styleOverrides: {
                root: {
                    borderRadius: "3px",
                    padding: "2px 5px",
                    "&:after, &:before": {
                        display: "none"
                    },
                    background: "#ebeff2"
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#0000001f"
                    }
                }
            }
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    "&.MuiInputLabel-root": {
                        top: 2
                    }
                }
            }
        }
    }
});

export default theme;