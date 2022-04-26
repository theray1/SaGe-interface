import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import SlideBar from "./SlideBar";


function queryLeaf(props){

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
        borderColor: props.selected ? 'green' : 'black'
    };

    return (
        <div className="query-leaf" style={nodeStyle}>
            <Handle type='source' position="top"/>
            <Handle type='target' position="bottom"/>
            {props.data.label}
            <br/>
            {props.data.cardinality}
            <br/>
            {props.data.cumulativeCardinality}
            <SlideBar progress={Math.floor(100 * props.data.patternProduced / props.data.cardinality)}></SlideBar>
        </div>
    );
}

export default queryLeaf;