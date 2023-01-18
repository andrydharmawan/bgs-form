const reducer = (state, data) => {
    return {
        ...state,
        ...data.data
    }
}
export default reducer;