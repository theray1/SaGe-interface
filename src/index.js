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
  MiniMap,
} from 'react-flow-renderer';
import dagre from 'dagre';
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
import { roundDownFiveDecimals } from './util';
import QueryProgressSlideBar from './slidebars/QueryProgressSlideBar';
import YASQE from 'yasgui-yasqe';
import "./yasqe.css";

const nodeTypes = { projectionNode: ProjectionNode,
                    joinNode: JoinNode,
                    unionNode: UnionNode,
                    filterNode: FilterNode,
                    scanNode: ScanNode,
                    valuesNode: ValuesNode,
                    insertNode: InsertNode,
                    deleteNode: DeleteNode};

function App(){

  //bsbm10
  //"query": "SELECT ?s ?p ?o WHERE { ?s ?p ?o }"
  //"query": "PREFIX p1: <http://www.w3.org/2000/01/rdf-schema#> PREFIX p2: <http://purl.org/dc/elements/1.1/> PREFIX p3: <http://www.w3.org/2001/XMLSchema#> SELECT ?label WHERE { ?s p2:date '2000-07-15'^^p3:date; p1:label ?label . FILTER regex(?label, 't', 'i') }",
    
  //bsbm1k
  //"query": "PREFIX p1: <http://www.w3.org/2001/XMLSchema#> PREFIX p2: <http://purl.org/dc/elements/1.1/> SELECT ?s ?p ?o WHERE { ?s p2:date ?date . FILTER (?date > '2004-01-01'^^p1:date) }"
  //"query": "PREFIX p1: <http://www.w3.org/2001/XMLSchema#> PREFIX p2: <http://purl.org/dc/elements/1.1/> PREFIX p3: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX p4: <http://www4.wiwiss.fu-berlin.de/bizer/bsbm/v01/vocabulary/> SELECT ?s ?p ?o WHERE { ?s ?p ?o; p2:date ?date; p3:type p4:Review . FILTER (?date > '2004-01-01'^^p1:date) }",

  //Query management
  let sparqlRequest = {
    query: "PREFIX p1: <http://www.w3.org/2001/XMLSchema#>\nPREFIX p2: <http://purl.org/dc/elements/1.1/>\nPREFIX p3: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nPREFIX p4: <http://www4.wiwiss.fu-berlin.de/bizer/bsbm/v01/vocabulary/>\nPREFIX p5: <http://www4.wiwiss.fu-berlin.de/bizer/bsbm/v01/instances/dataFromProducer4/>\nSELECT ?s ?p ?o WHERE { { SELECT * WHERE { ?s ?p ?o; p2:date ?date; p3:type p4:Review . FILTER (?date > '2004-01-01'^^p1:date) } } UNION { SELECT * WHERE { ?s ?p ?o; p4:reviewFor ?reviewed . } } }",
    defaultGraph: "http://example.org/bsbm"
  };

  let sparqlServer = "http://localhost:8000/sparql";

  const [yasqe, setYasqe] = useState();

  const [query, setQuery] = useState(null);

  const [isQueryEditable, setIsQueryEditable] = useState(true);
  const [isQueryResumeable, setIsQueryResumeable] = useState(false);
  const [isAutoRunOn, setIsAutoRunOn] = useState(false);

  const nodeWidth = 600;
  const nodeHeight = 250;
  
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const [nextLink, setNextLink] = useState(null);

  var [nodes, setNodes, onNodesChange] = useNodesState([]);// Declaring nodes with var allows to force update the nodes variable without using setNodes, which is useful since while setNodes guarantees sync with render, it also sometimes delays the actual updating of the variable. 
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [exportMetric, setExportMetric] = useState("");
  const [importMetric, setImportMetric] = useState("");
  const [cardinalityMetric, setCardinalityMetric] = useState("");
  const [costMetric, setCostMetric] = useState("");
  const [coverageMetric, setCoverageMetric] = useState("");
  const [progressionMetric, setProgressionMetric] = useState("");
    
  //componentDidMount equivalent. It is used to create the yasqe editor once, when the page is loaded
  useEffect(() => {
      const newYasqe = YASQE(document.getElementById("YasqeEditor"));
      newYasqe.setValue(sparqlRequest["query"]);
      setYasqe(newYasqe);
  }, []);

  useEffect(() => {
    
  }, [yasqe])

  useEffect(() => {
    if(yasqe === undefined){
      console.log("yasqe is undefined");
    } else {
      console.log("yasqe is defined");
    }
  })

  //nextLink watcher for autorun
  useEffect(() => {
    if(isAutoRunOn && nextLink !== null){
      commitNextUntilQueryIsOver();
    }
  }, [nextLink]);

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

  //Lays out a graph composed of #nodes and #edges
  const layoutElements = (nodes, edges) => {
    dagreGraph.setGraph({ rankdir: 'BT', align: ''});
  
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


  const updateGraph = (graph) => {
    var newNodes = [];

    graph.forEach(element => {
      if(element.position !== undefined){//The element has a position, thus it is a node

        newNodes.push(element);
        
      }
    })

    newNodes.forEach((newNode) => {
      nodes.forEach((oldNode) => {
        if(oldNode.id === newNode.id){
          
          if(document.activeElement === document.getElementById(newNode.id)){
          
            var newX = parseInt(document.getElementById(newNode.id).getAttribute("xposition"), 10);
            var newY = parseInt(document.getElementById(newNode.id).getAttribute("yposition"), 10);
            
            var newPosition = { x: newX, y: newY };
            
            newNode.position = newPosition;
          
          }else {
          
            newNode.position = oldNode.position;
          
          }
        
        }
      })
    })

    
    
    setNodes(newNodes);
   
  }

  //Starts the process of parsing the query and sending the query to the SaGe server 
  const commitQuery = () => {
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

      if(data["hasNext"]){

        let graphElements = protoplan_to_graph(data["next"]);
        createGraph(graphElements);
        setNextLink(data["next"]);
        setIsQueryResumeable(true);

      } else {

        alert("All the elements were found in one quantum! If you would like to have the data, and a more detailed execution plan, please reduce the max_results attribute or the quota attribute in your config file");
      
      }


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

    let promise = fetch(sparqlServer, fetchInstructions)
    .then(res => res.json())
    .then(data => {

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

  //
  function autoRunQuery(){
    commitQuery().then(
      (response) => {


        setIsAutoRunOn(response["hasNext"]);
  
  
        if(response["hasNext"]){
          commitNextUntilQueryIsOver();      
        }
      }
    )
  }


  //Sends a request for one quantum and changes the value of isAutoRunOn according to the response
  function commitNextUntilQueryIsOver(){
    commitNext().then((data) => {
      
        setIsAutoRunOn(data["hasNext"]);
      
    });
  }

  const createRequest = (rawQuery) => {
    const queryWithoutUselessCharacters = rawQuery.replace(/\r?\n|\r/g, "");
    sparqlRequest["query"] = queryWithoutUselessCharacters;

    return JSON.stringify(sparqlRequest);
  }

  const getQueryInput = () => {
    console.log(yasqe.getValue());
    console.log(yasqe.getValue());
    return yasqe.getValue();
  }

  //Button input handling
  const handleCommitQueryMouseDown = () => {
    setQuery(createRequest(getQueryInput()));
  }

  const handleCommitQueryClick = () => {
    if(isQueryEditable){
      commitQuery();
    }
  }

  const handleResumeMouseDown = () => {
    setIsAutoRunOn(false);
  }

  const handleResumeClick = () => {
    if(isQueryResumeable){
      commitNext();
    }
  }

  const handleAutoRunMouseDown = () => {
    if(nextLink === null){
      setQuery(createRequest(getQueryInput()));
    }
  }

  const handleAutoRunClick = () => {
    if(nextLink === null){
      if(isQueryEditable){
        autoRunQuery();
      }
    } else {
      commitNextUntilQueryIsOver();
      setIsAutoRunOn(true);
    }
  }

  const handleStopAutoRunClick= () => {
    setIsAutoRunOn(false);
  }

  const handleLayoutClick = () => {
    createGraph(nodes.concat(edges));
  }

  const handleDebugClick = () => {
    console.log(yasqe.getValue());
  }

  return(
    <div className="App">
      
      <div className="Header">
        <div className="CreditsAndUsefulLinks">
          <ul>
            <li>
              <a href="https://github.com/theray1/SaGe-interface">Project Github</a>
            </li>
            <li>
              <a href="http://sage.univ-nantes.fr/">SaGe</a>
            </li>
          </ul>
          <div className="About">
            This project has been made possible thanks to: LS2N, Hala Skaf-Molli, Pascal Molli, Julien, Wang and Vincent. 
            <br/>It has been realized during a two-month internship (April - May 2022) by Erwan Boisteau-Desdevises. 
          </div>
        </div>

        <div className="Inputs">
          <div className="YasqeWrapper">
            <div id="YasqeEditor">
            </div>
          </div>
         
          <br/>

          <table className="Buttons">
            <tbody>
              <tr className="ButtonsTable1">
                <th><button id="commitQueryButton" onMouseDown={() => handleCommitQueryMouseDown()} onClick={() => handleCommitQueryClick()}>Commit Query</button></th>
                <th><button id="resumeQueryButton" onMouseDown={() => handleResumeMouseDown()} onClick={() => handleResumeClick()}>Next Quantum</button></th>
                <th><button id="autoRunQueryButton" onMouseDown={() => handleAutoRunMouseDown()} onClick={() => handleAutoRunClick()}>Auto-Run Query</button></th>
              </tr>
              <tr className="ButtonsTables2">
                <th><button id='stopAutoRun' onClick={() => handleStopAutoRunClick()}>Stop Auto-Run</button></th>
                <th><button id='debugButton' onClick={() => {handleDebugClick()}}>Debug Button</button></th>
                <th><button id='layoutButton' onClick={() => handleLayoutClick()}>Re-Layout Graph</button></th>
              </tr>
            </tbody>
          </table>

  
        </div>
      </div>

    

      <div className="MainGraphWithMetrics">
        
        <div className="Metrics">
          <div className="MetricsContent">
            Export:<br/>{roundDownFiveDecimals(stats.exportMetric)}<br/><br/>
            Import:<br/>{roundDownFiveDecimals(stats.importMetric)}<br/><br/>
            Cardinality:<br/>{roundDownFiveDecimals(stats.cardinalityMetric)}<br/><br/>
            Cost:<br/>{roundDownFiveDecimals(stats.costMetric)}<br/><br/>
            Coverage:<br/>{roundDownFiveDecimals(stats.coverageMetric)}<br/><br/>
            Progression:<br/>
            <QueryProgressSlideBar backgroundColor={"#eb7ce1"} progressBarColor={"#80036d"} progressValue={stats.progressionMetric*100}/>
          </div>
        </div>      
        <div className="MainGraph">
          <ReactFlow
            nodes={nodes} 
            edges={edges} 
            nodeTypes={nodeTypes} 
            onNodesChange={onNodesChange} 
            fitView
            minZoom={0.1} 
            maxZoom={5}>
              <Controls/>
            </ReactFlow>
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
