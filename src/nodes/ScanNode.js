import React from "react";
import { Handle } from "react-flow-renderer";
import NodeProgressBar from "../progressbars/NodeProgressBar";
import ContainerNode from "./ContainerNode";
import { dataToTable } from "../util";
import ReactSlider from "react-slider";
import './Slider.css';

function ScanNode(props){

    const nodeData = props;
    const coverage = 100 * nodeData.data.lastRead / nodeData.data.cardinality;

    /**
   * Displays the node's current values for each variable
   * @param data The data to be displayed, as a two-dimensional array
   * @returns A babel table containing the current value of each variable
   */
    const cleanAttributesDisplay = (data) => {
      return dataToTable(data, "ScanNodeMainData");
    }

    const getLastRead = () => {
      return nodeData.data.lastRead;
    }

    const content = 
      <div className="QueryNode">
        <ReactSlider
          id={nodeData.id}
          className="OffSetSlider"
          thumbClassName="Thumb"
          trackClassName="Track"
          max={nodeData.data.cardinality}
          defaultValue={parseInt(getLastRead())}
          renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        />
        <div className="Handles">
          <Handle type='source' position="top"/>
        </div>
        <div className="MainData">
          {cleanAttributesDisplay([
            ["SUBJECT",nodeData.data.pattern.subject],
            ["PREDICATE", nodeData.data.pattern.predicate],
            ["OBJECT", nodeData.data.pattern.object],
            ["Cardinality ", nodeData.data.cardinality],
            ["Produced ", nodeData.data.produced],
            ["Last Read", nodeData.data.lastRead]
          ])}
          <br/>
          <div id={"NodeProgressBarContainer" + nodeData.id} className="NodeProgressBarContainer">
            <NodeProgressBar backgroundColor={"#525252"} progressBarColor={"#80036d"} progressValue={coverage}/>
          </div>
          
          
        </div>
        <div className="DisplayData">
          Cost: <br/>{nodeData.data.cost}<br/>
          Produced (cumulative): <br/>{nodeData.data.cumulativeProduced}<br/>
          Cardinality (cumulative): <br/>{nodeData.data.cumulativeCardinality}<br/>
        </div>
      </div>

    return (
      <ContainerNode content={content} childProps={nodeData}></ContainerNode>  
    );
}

export default ScanNode;