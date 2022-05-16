
const roundDownFiveDecimals = (number) => {
    return __roundDown(number, 5);
}

const __roundDown = (number, trunc) => {
    return Math.floor(number * Math.pow(10, trunc))/Math.pow(10, trunc);
}

const __createCells = (data) => {
    var key = 0;
    return data.map(cell => {
        key++;
        return <th key={key}>{cell}</th>;
    })
}

const __createRows = (data) => {
    var key = 0;
    return data.map(row => {
        key++;
        return <tr key={key}>{__createCells(row)}</tr>;
    })
}

const getTableFrom2DArray = (data, className) => {
    return (
        <table className={className}>
            <tbody>
                {__createRows(data)}
            </tbody>        
        </table>
    )
}

export { getTableFrom2DArray, roundDownFiveDecimals };