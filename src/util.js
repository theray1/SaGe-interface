
const roundDownFiveDecimals = (number) => {
    return __roundDown(number, 5);
}

const __roundDown = (number, trunc) => {
    return Math.floor(number * Math.pow(10, trunc))/Math.pow(10, trunc);
}

export default roundDownFiveDecimals;