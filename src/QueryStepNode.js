import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import SlideBar from "./SlideBar";


function QueryStepNode({data, selected}){

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

    return (
        <div className="custom-node" style={nodeStyle}>
            <Handle type='source' position="top"/>
            <Handle type='target' position="bottom"/>
            {data.nodetype}
            <SlideBar progress={data.progress}></SlideBar>
        </div>
    );
}

export default QueryStepNode;