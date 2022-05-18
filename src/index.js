import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import ReactFlow, {
  Controls,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import dagre from 'dagre';
import {
  nextLink_to_graph
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

  const [stateManager, setStateManager] = useState(null);

  const [isQueryCommitable, setIsQueryCommitable] = useState(true);
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
    
  //componentDidMount equivalent. It is used to create the yasqe editor and the state manager once and only once, when the page is loaded
  useEffect(() => {
      const newYasqe = YASQE(document.getElementById("YasqeEditor"));
      newYasqe.setValue(sparqlRequest["query"]);
      setYasqe(newYasqe);

      const newStateManager = new StateManager();
      setStateManager(newStateManager);
  }, []);

  //nextLink watcher for autorun
  useEffect(() => {
    if(isAutoRunOn && nextLink !== null){
      commitNextUntilQueryIsOver();
    }
  }, [nextLink]);

  /**
   * Update the rendering of the main stats of the query execution
   * @param {*} queryStats The new stats to be displayed
   */
  const updateStats = (queryStats) => {
    setExportMetric(queryStats["export"]);
    setImportMetric(queryStats["import"]);
    setCardinalityMetric(queryStats["metrics"]["cardinality"]);
    setCostMetric(queryStats["metrics"]["cost"]);
    setCoverageMetric(queryStats["metrics"]["coverage"]);
    setProgressionMetric(queryStats["metrics"]["progression"]);
  }

  /**
   * Reset stats to their default value, 0
   */
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

  /**
   * Lays out a graph to have a readable shape
   * @param {*} nodes The array of nodes from the graph to be layed out
   * @param {*} edges The array of edges from the graph to be layed out
   * @returns An object composed of the array of nodes with updated positions and the array of edges
   */
  const layoutElements = (nodes, edges) => {
    
    //Sets the direction of the graph to bottom-to-top
    dagreGraph.setGraph({ rankdir: 'BT', align: ''});
  
    //Provides dagre with each node, and the space between them
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
  
    //Provides dagre with the relation between each node
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
  
    //Computes the position of each node on the graph
    dagre.layout(dagreGraph);
  
    //Sets each node's position to the position computed by dagre
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

    //We do not need to use the returned value, as the node passed as arguments are direcly modified
    return { nodes, edges };
  };

  const isNode = (element) => {
    //This condition verifies that element is a node, since all nodes always have a position but edges never do
    return element.position !== undefined;
  }
 
  /**
   * Takes a graph and updates the nodes and edges arrays accordingly, and lays out the graph
   * @param {*} newGraph The array of elements (nodes and edges) from which the graph is going to be created
   */
  const createGraph = (newGraph) => {

    var newNodes = [];
    var newEdges = [];

    //Iterates over every element of newGraph to separate nodes and edges
    newGraph.forEach(element => {
      if(isNode(element)){

        newNodes.push(element);
      
      } else {

        newEdges.push(element);
      
      }
    })

    //Computes the position of the elements of the graph
    layoutElements(newNodes, newEdges);


    //Sets the current graph to the one created from newGraph 

    //Sets the edges of newGraph as the edges of the current graph 
    setEdges(newEdges);

    //Sets the nodes of newGraph as the nodes of the current graph
    setNodes(newNodes);


    //setNodes does not instantly modifies the value of the nodes hook; this is a problem for the auto run and only using setNodes will cause the graph to be properly
    //laid out only for the first quantum. The only fix I could find was to manually modify the nodes hook.
    //This is not the intented way to use hooks and this probably shouldn't be done this way.
    nodes = newNodes;
  }

  /**
   * Updates data dislayed inside the nodes of the current graph based on the data of a new graph, without changing its current layout
   * This is meant to be used when graph has the same nodes and edges as the current graph, but the data inside each node is different
   * @param {*} newGraph The graph to be updated
   */
  const updateGraph = (newGraph) => {
    var newNodes = [];

    //Iterates over every element of graph to keep only the nodes in newNodes
    newGraph.forEach(element => {
      if(isNode(element)){

        newNodes.push(element);
        
      }
    })

    
    newNodes.forEach((newNode) => {
      nodes.forEach((oldNode) => {
        if(oldNode.id === newNode.id){
          //The following code is executed only when we find a node from newGraph with same id as a node from the current graph. 
          //This means they represent the same node, and the data of the node from the current graph needs to be replaced with 
          //the data from the node from newGraph


          
          if(document.activeElement === document.getElementById(newNode.id)){
            //The following code is executed only when the node currently being updated corresponds to a node being dragged by the user at the same time
            //We cannot simply set the new position to the one at the beginning of the last quantum, since it probably isn't currently the actual position of the node
            //Instead, we can use xPos and yPos which are not tied to the JSON representation of the node
            //This fix is a bit of a workaround, as it required the position to be included in the HTML attributes of the node and there is probably an easier way to do it
            //But at least, it works

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

  /**
   * Starts the processing of a query by sending it to SaGe server and creating a graph according to the response's nextLink
   * @returns A promise of response from the query sent to the SaGe server
   */
  const commitQuery = () => {
    setIsQueryCommitable(false);

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

        let graphElements = nextLink_to_graph(data["next"]);
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

  /**
   * Sends the next part of the ongoing query to the SaGe server
   * @returns A promise of response from the query sent to the SaGe server 
   */
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
          
          let graphElements = nextLink_to_graph(data["next"]);
          updateGraph(graphElements);
        
        } else {//The query isn't over but user has modified the query execution plan since the last quantum
        
          console.log("How did you get there? Query exec plan modification isn't even implemented yet...")
          let graphElements = nextLink_to_graph(data["next"]);
          createGraph(graphElements);
        }
        
      } else {//Query is over
        
        setIsQueryCommitable(true);
        setIsQueryResumeable(false);
      
      }

      updateStats(data["stats"]);
      setNextLink(data["next"]);

      return data;
    })
    .catch((error) => {console.log(error)});
    return promise;
  }

  /**
   * Starts the process of running the whole query automatically
   */
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

  /**
   * Sends the next part of the ongoing query as long as the last response had a non null nextLink
   */
  function commitNextUntilQueryIsOver(){
    commitNext().then((data) => {
      
        setIsAutoRunOn(data["hasNext"]);
      
    });
  }

  /**
   * Sets the current sparqlRequest's query to the rawQuery parameter, while removing useless spaces and line breaks
   * @param {*} rawQuery The unprocessed query to be set as the current sparqlRequest query
   * @returns The stringified sparqlRequest with the new query
   */
  const createRequest = (rawQuery) => {
    const queryWithoutUselessCharacters = rawQuery.replace(/\r?\n|\r/g, "");
    sparqlRequest["query"] = queryWithoutUselessCharacters;

    return JSON.stringify(sparqlRequest);
  }

  /**
   * QueryInput getter
   * @returns The current value of the yasqe query editor
   */
  const getQueryInput = () => {
    return yasqe.getValue();
  }

  /*Button input handling*/

  const handleCommitQueryMouseDown = () => {
    setQuery(createRequest(getQueryInput()));
  }

  const handleCommitQueryClick = () => {
    if(isQueryCommitable){
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
      if(isQueryCommitable){
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
            Thanks to: LS2N, Hala Skaf-Molli, Pascal Molli, Julien, Wang and Vincent. 
            <br/>Author : Erwan Boisteau-Desdevises
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
            <div id="QueryProgressBarContainer" className="QueryProgressBarContainer">
              <QueryProgressSlideBar backgroundColor={"#eb7ce1"} progressBarColor={"#80036d"} progressValue={stats.progressionMetric*100}/>
            </div>
              
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
