import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";


function JoinNode(props){

  const cleanAttributeDisplay = () => {
    return (
      props.data.mucMap.map((value) => {
        const str1 = JSON.stringify(value[0]);
        const str2 = JSON.stringify(value[1]);
        return (
          <div key={str1}>
            {"- " + str1.substring(2, str1.length - 1) + " : " + str2.substring(2, str2.length - 1)}<br/>
          </div>
        );
      })
    )
  } 

    const content = <div className="QueryNode">
    <div className="Handles">
    <Handle type='source' position="top"/>
    <Handle type='target' position="bottom"/>
    </div>
    <div className="DisplayData">
    mucMap: <br/>{cleanAttributeDisplay()}
    </div>
    <div className="MainData">
      
    </div>
</div>

return (
    <ContainerNode content={content} childProps={props}></ContainerNode>  
  );
}

export default JoinNode;