import React, { useCallback } from "react";
import { Handle } from "react-flow-renderer";
import ContainerNode from "./ContainerNode";


const ProjectionNode = (props) => {


    const cleanAttributeDisplay = () => {
      return (
        props.data.valuesList.map((value) => {
          const str = JSON.stringify(value);
          return (
            <div key={str}>
              {"- " + str.substring(2, str.length - 1)}<br/>
            </div>
          );
        })
      )
    }

    const content = <div className="query-node">
                        <Handle type='source' position="top"/>
                        <Handle type='target' position="bottom"/>
                        Projection sur les attributs: <br/>{cleanAttributeDisplay()}
                    </div>

    return (
      <ContainerNode content={content} childProps={props}></ContainerNode>  
    );
}

export default ProjectionNode;