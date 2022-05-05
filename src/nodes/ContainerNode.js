import React, { useCallback, useState } from "react";
import { Handle } from "react-flow-renderer";
import './ContainerNode.css';

const ContainerNode = (props) => {

    const [isSelected, setIsSelected] = useState(true);

    const doubleClickHandler = (event) => {

        const targetedNode = event.target;
        const targetContainedNode = targetedNode.getElementsByClassName("ContainedNode")[0];
        const targetQueryNode = targetContainedNode.getElementsByClassName("QueryNode")[0];
        const targetDisplayData = targetQueryNode.getElementsByClassName("DisplayData")[0];
        setIsSelected(!isSelected);

        if(isSelected){
            targetedNode.classList.add("ContainerNodeFocused");
            targetDisplayData.classList.add("DisplayDataFocused");
        } else {
            targetedNode.classList.remove("ContainerNodeFocused");
            targetDisplayData.classList.remove("DisplayDataFocused");
        }

    }

    return (
        <div>
            <div className="ContainerNode" id={props.childProps.id} onDoubleClick={(e) => {doubleClickHandler(e)}} tabIndex="0">
                <div className="Label">{props.childProps.data.label}</div>
                <br/><br/><br/>
                <div className="ContainedNode">{props.content}</div>
            </div>
        </div>
    );
}

export default ContainerNode;