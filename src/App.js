import "./style.css";
import React from "react";
import "./initial-elements"
import { useState } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
/*import { nodes } from "./initial-elements";*/

const width = 1920;
const height = 1080;

/*class Tree extends React.Component{

  constructor(props){
    super(props);
    this.state = {nodes: nodesInit, edges: edgesInit} 
  }

  createLeftLinearTree(){

  }

  setTree(nodes, edges){
    this.setState({
      nodes: nodes,
      edges: edges
    })
  }

  render() {
    return (
      <>
        <ReactFlow nodes={this.state.nodes} edges={this.state.edges} 
      fitView
      attributionPosition="top-right">
        <Controls /></ReactFlow>
      </>
    );
  }

}*/

const nodesInit = [
  {
    id: "1",
    type: "default",
    data: { 
      label: "Test node 1",
    },
    draggable: true,
    position: { x: 150, y: 150 }
  },

  {
    id: "2",
    type: "default",
    data: { 
      label: "Test node 2",
    },
    position: { x: 250, y: 250 }
  },
  {
    id: "3",
    type: "default",
    data: { 
      label: "Test node 3",
    },
    position: { x: 350, y: 350 }
  }
];

const edgesInit = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "default",
    animated: true
  },

  {
    id: "e1-3",
    source: "1",
    target: "3",
    type: "default",
    animated: true
  }
];

class TreeModifierButtton extends React.Component{
  render(){
    return (
      <button onClick={this.props.onClick}>Click me and the tree might disappear!</button>
    )
  }
}



export default function App() {
  const graphStyle = { width: "100%", height: "600px" }

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesInit);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesInit);



  return (
    <div className="App" style={graphStyle}>
      <h1>Query Change Monitoring</h1>
      <h2>Prototype and bidouillage</h2>
      <TreeModifierButtton onClick={(e) => alert("Button doesn't modify tree just yet")} />
      <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      attributionPosition="top-right"
    >
      <Controls />
    </ReactFlow>
    </div>
  );
}


