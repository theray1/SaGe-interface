import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import SlideBar from "./SlideBar";


function queryLeaf({data, selected}){

    const nodeStyle = {
        border: '2px solid black',
        textAlign: 'center',
        padding: 0,
        paddingTop: 10,
        paddingBottom: 10,
        width: 200,
        fontSize: '0.7rem',
        backgroundColor: 'white',
        borderRadius: 4,
        borderColor: selected ? 'green' : 'black'
    };

    const d = data;
    const test = Math.floor(100 * data.patternProduced / data.cardinality);

    return (
        <div className="query-leaf" style={nodeStyle}>
            <Handle type='source' position="top"/>
            <Handle type='target' position="bottom"/>
            {data.label}
            <br/>
            {data.cardinality}
            <br/>
            {data.cumulativeCardinality}
            <SlideBar progress={test}></SlideBar>
        </div>
    );
}

export default queryLeaf;