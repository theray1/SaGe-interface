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
 * Used by dataToTable. Creates the rows of the table
 * @param {*} data An array composed of 2-element arrays
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
 * @param {*} data An array composed of 2-element arrays
 * @param {*} className The class name given to the resulting table
 * @returns A table of two columns and as many rows as they were arrays in fata
 */
const dataToTable = (data, className) => {
    return (
        <table className={className}>
            <tbody>
                {__createRows(data)}
            </tbody>        
        </table>
    )
}

//unsure if this works perfectly, but sage does seem to accept it the way it is, like everyone should <3
/**
 * Transforms a composite JSON object into a similar array.
 * @param {*} json The JSON object to be tranformed
 * @returns An array containing the same data as the JSON object
 */
const jsonToArray = (json) => {
    var array = [];

    for(var elt in json){
        if(json[elt] !== undefined){
            if(json[elt].constructor === ({}).constructor){
                array.push(jsonToArray(json[elt]));
            } else {
                array.push(json[elt]);
            }
        } else {
            array.push(undefined);
        }
    }

    return array;
}


const displayResult = (result, key) => {
    
    var row = [];

    for(var element in result){
        row.push(
            <th key={key+element}>
                {result[element]}
            </th>
        );
    }

    return (
        <tr key={key}>
            {row}
        </tr>
    ) ;

}

const displayResults = (results) => {
    
    var rows = [];

    for(var result in results) {
        var val = results[result];
        rows.push(
            <tr key={JSON.stringify(val)}>
                {displayResult(val, JSON.stringify(val))}
            </tr>
        );
    }
    return rows;
}

export { dataToTable, roundDownFiveDecimals, jsonToArray, displayResults, displayResult };