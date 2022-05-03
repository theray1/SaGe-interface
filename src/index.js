//TODO: Clean les imports
import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import ReactFlow, {
  addEdge,
  Controls,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import dagre from 'dagre';
import {nodesInit, edgesInit} from './initial-elements';
import {
  protoplan_to_graph
} from './parser';
import ProjectionNode from './nodes/ProjectionNode';
import JoinNode from './nodes/JoinNode';
import UnionNode from './nodes/UnionNode';
import FilterNode from './nodes/FilterNode';
import ScanNode from './nodes/ScanNode';
import ValuesNode from './nodes/ValuesNode';
import InsertNode from './nodes/InsertNode';
import DeleteNode from './nodes/DeleteNode';
import SlideBar from './SlideBar';
import roundDownFiveDecimals from './util';

const nodeTypes = { projectionNode: ProjectionNode,
                    joinNode: JoinNode,
                    unionNode: UnionNode,
                    filterNode: FilterNode,
                    scanNode: ScanNode,
                    valuesNode: ValuesNode,
                    insertNode: InsertNode,
  
  
                    deleteNode: DeleteNode};

function App(){

  // SELECT ?s ?p ?o WHERE { ?s ?p ?o }
  //"query": "PREFIX p1: <http://www.w3.org/2000/01/rdf-schema#> PREFIX p2: <http://purl.org/dc/elements/1.1/> PREFIX p3: <http://www.w3.org/2001/XMLSchema#> SELECT ?label WHERE { ?s p2:date '2000-07-15'^^p3:date; p1:label ?label . FILTER regex(?label, 't', 'i') }",
    

  //Query management
  let sparqlRequest = {
    "query": "PREFIX p1: <http://www.w3.org/2000/01/rdf-schema#> PREFIX p2: <http://purl.org/dc/elements/1.1/> PREFIX p3: <http://www.w3.org/2001/XMLSchema#> SELECT ?label WHERE { ?s p2:date '2000-07-15'^^p3:date; p1:label ?label}",
    "defaultGraph": "http://example.org/bsbm"
  };

  let sparqlServer = "http://localhost:8000/sparql";

  var [nodes, setNodes, onNodesChange] = useNodesState([]);// Declaring nodes with var allows to force update the nodes variable without using setNodes, which is useful since while setNodes guarantees sync with render, it also sometimes delays the actual updating of the variable. 
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [query, setQuery] = useState(null);

  const [nextLink, setNextLink] = useState(null);
  const [queryInput, setQueryInput] = useState(JSON.stringify(sparqlRequest));

  const [isQueryEditable, setIsQueryEditable] = useState(true);
  const [isQueryResumeable, setIsQueryResumeable] = useState(false);
  const [isAutoRunOn, setIsAutoRunOn] = useState(false);

  const nodeWidth = 300;
  const nodeHeight = 150;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  //Lays out a graph composed of #nodes and #edges
  const layoutElements = (nodes, edges) => {
    dagreGraph.setGraph({ rankdir: 'BT', align: 'DR'});
  
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
  
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
  
    dagre.layout(dagreGraph);
  
    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition =  'top';
      node.sourcePosition =  'bottom';
  
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    });
    return { nodes, edges };
  };
 

  //Takes an array of graph elements (nodes and edges) and sets it as the displayed graph, and updates nodes and edges arrays accordingly
  const createGraph = (graph) => {

  var newNodes = [];
  var newEdges = [];

    graph.forEach(element => {
      if(element.position !== undefined){

        newNodes.push(element);
      
      } else {

        newEdges.push(element);
      
      }
    })

    layoutElements(newNodes, newEdges);

    setNodes(newNodes);
    nodes = newNodes;
    setEdges(newEdges);

  }

  //Very optimizable
  const updateGraph = (graph) => {
    var newNodes = [];

    graph.forEach(element => {
      if(element.position !== undefined){

        newNodes.push(element);
      
      }
    })

    newNodes.forEach((newNode) =>{
      var oldPosition = {x: 0, y: 0};

      nodes.forEach((oldNode) =>{
        if(oldNode.id === newNode.id){
          oldPosition = oldNode.position;
        }
      })

      newNode.position = oldPosition;
    });

    setNodes(newNodes);
  }

  //Starts the process of parsing the query and sending the query to the SaGe server 
  const commitQuery = () => {
    console.log("Running : ", query);
    setIsQueryEditable(false);

    let fetchData = {
      method: 'POST',
      body: query,
      headers: {
        "Content-type": "application/json",
        "accept": "application/json"
      }
    }

    let promise = fetch(sparqlServer, fetchData)
    .then(res => res.json())
    .then(data => {

      console.log("data: ", data);

      if(data["hasNext"]){

        let graphElements = protoplan_to_graph(data["next"]);
        createGraph(graphElements);
        setNextLink(data["next"]);
        setIsQueryResumeable(true);

      } else {

        alert("All the elements were found in one quantum! If you would like to have the plan, and a more detailed execution plan, please reduce the max_results attribute or the quota attribute in your config file");
      
      }

      console.log("Response's next link", data["next"]);

      updateStats(data["stats"]);
      
      return data;
    })
    .catch(error => {console.log("Error caught"); console.log(error)});

    return promise;
  }

  //Sends the next part of the ongoing query
  const commitNext = () => {

    //From the initial query
    const queryTemp = JSON.parse(query);
    //We add the next link to the query object, so that once we send the query, the SaGe server knows where it last stopped
    queryTemp["next"] = nextLink;

    let fetchInstructions = {
      method: 'POST',
      body: JSON.stringify(queryTemp),
      headers: {
        "Content-type": "application/json",
        "accept": "application/json"
      }
    }

    console.log("Next fetch instructions: ", fetchInstructions);

    let promise = fetch(sparqlServer, fetchInstructions)
    .then(res => res.json())
    .then(data => {
      console.log("Response: ", data);

      if(data["hasNext"]){

        if(!false/*A remplacer par un check de modification de la query?*/){//The query isn't over and user hasn't modified the query execution plan since the last quantum
          
          let graphElements = protoplan_to_graph(data["next"]);
          updateGraph(graphElements);
        
        } else {//The query isn't over but user has modified the query execution plan since the last quantum
        
          console.log("How did you get there? Query exec plan modification isn't even implemented yet...")
          let graphElements = protoplan_to_graph(data["next"]);
          createGraph(graphElements);
        }
        
      } else {//Query is over
        
        setIsQueryEditable(true);
        setIsQueryResumeable(false);
      
      }

      updateStats(data["stats"]);
      setNextLink(data["next"]);

      return data;
    })
    .catch((error) => {console.log(error)});
    return promise;
  }

  function autoRunQuery(){
    commitQuery().then(
      (response) => {

        console.log("mmmh");

        setIsAutoRunOn(response["hasNext"]);

        if(response["hasNext"]){
          commitNextUntilQueryIsOver();      
        }
      }
    )
  }

  //nextLink watcher for autorun
  useEffect(() => {
    if(isAutoRunOn && nextLink !== null){
      commitNextUntilQueryIsOver();
    }
  }, [nextLink]);

  function commitNextUntilQueryIsOver(){
    commitNext().then((data) => {
      setIsAutoRunOn(data["hasNext"]);
    });
  }
  
  const [exportMetric, setExportMetric] = useState("");
  const [importMetric, setImportMetric] = useState("");
  const [cardinalityMetric, setCardinalityMetric] = useState("");
  const [costMetric, setCostMetric] = useState("");
  const [coverageMetric, setCoverageMetric] = useState("");
  const [progressionMetric, setProgressionMetric] = useState("");

  const updateStats = (queryStats) => {
    setExportMetric(queryStats["export"]);
    setImportMetric(queryStats["import"]);
    setCardinalityMetric(queryStats["metrics"]["cardinality"]);
    setCostMetric(queryStats["metrics"]["cost"]);
    setCoverageMetric(queryStats["metrics"]["coverage"]);
    setProgressionMetric(queryStats["metrics"]["progression"]);
  }

  const resetStats = () => {
    setExportMetric(0);
    setImportMetric(0);
    setCardinalityMetric(0);
    setCostMetric(0);
    setCoverageMetric(0);
    setProgressionMetric(0);
  }

  const stats={
   exportMetric: exportMetric,
   importMetric: importMetric,
   cardinalityMetric: cardinalityMetric,
   costMetric: costMetric,
   coverageMetric: coverageMetric,
   progressionMetric: progressionMetric, 
  }

  return(
    <div className="App">

    <div className="Header">
      <textarea rows={6} className="QueryInput" placeholder='Query' type="text" value={queryInput} onChange={(e) => {if(isQueryEditable)setQueryInput(e.target.value)}}></textarea>

      <br></br>
      <br></br>

      <button id="commitQueryButton" onMouseDown={() => {setQuery(queryInput)}} onClick={() => {if(isQueryEditable){commitQuery()}}}>Commit Query</button>

      <button id="resumeQueryButton" onClick={() => {if(isQueryResumeable)commitNext()}}>Resume Query</button>

      <button id="autoRunQueryButton" onMouseDown={() => {setQuery(queryInput)}} onClick={() => {if(isQueryEditable)autoRunQuery();}}>Auto-Run Query</button>
    </div>

    

    <div className="MainGraphWithMetrics">
      <div className="MainGraph">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} fitView><Controls/></ReactFlow>
      </div>
      <div className="Metrics">
        <div className="MetricsContent">
          export:<br/>{roundDownFiveDecimals(stats.exportMetric)}<br/><br/>
          import:<br/>{roundDownFiveDecimals(stats.importMetric)}<br/><br/>
          cardinality:<br/>{roundDownFiveDecimals(stats.cardinalityMetric)}<br/><br/>
          cost:<br/>{roundDownFiveDecimals(stats.costMetric)}<br/><br/>
          coverage:<br/>{roundDownFiveDecimals(stats.coverageMetric)}<br/><br/>
          progression:<br/>
          <SlideBar progress={stats.progressionMetric * 100}/>
        </div>
      </div>      
    </div>
  </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);  

//<ReactFlow className='MainGraph1' edges={edges} nodes={nodes} onNodesChange={onNodesChange} nodeTypes={nodeTypes} style={graphStyle} fitView><Controls/></ReactFlow>
//<PlanGraphWithMetrics props={stats} nodes={nodes} edges={edges} onNodesChange={onNodesChange}/>

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
