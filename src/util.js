/**
 * Used by roundDownFiveDecimals. Truncates a number after a chosen decimal
 * @param {Number} number The number to be rounded down
 * @param {Number} trunc The number of decimals to be kept
 * @returns The truncated number
 */
const __roundDown = (number, trunc) => {
    return Math.floor(number * Math.pow(10, trunc))/Math.pow(10, trunc);
}

/**
 * Truncates a number after the fifth decimal
 * @param {*} number The number to be truncated
 * @returns The truncated number
 */
const roundDownFiveDecimals = (number) => {
    return __roundDown(number, 5);
}

/**
 * Used by __createRows. Creates the cells of the rows of the table
 * @param {*} data A 2-element array representing a row
 * @returns An array of 2 table cells
 */
const __createCells = (data) => {
    var key = 0;
    return data.map(cell => {
        key++;
        return <th key={key}>{cell}</th>;
    })
}

/**
 * Used by getTableFrom2DArray. Creates the rows of the table
 * @param {*} data The data to be translated, an rray composed of 2-element arrays
 * @returns An array of table rows, each containing the data of a 2-element array
 */
const __createRows = (data) => {
    var key = 0;
    return data.map(row => {
        key++;
        return <tr key={key}>{__createCells(row)}</tr>;
    })
}

/**
 * Transforms an array of 2-element arrays into a babel table
 * @param {*} data The data to be translated, an array composed of 2-element arrays
 * @param {*} className The class name given to the resulting table
 * @returns A table of two columns and as many rows as they were arrays in fata
 */
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