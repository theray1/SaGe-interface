//TODO: Clean les imports
import './index.css';
import ReactFlow, {
  addEdge,
  Controls,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import QueryNode from './QueryNode.js';
import QueryLeaf from './QueryLeaf';
import { nodesInit, edgesInit } from './initial-elements';  

const nodeTypes = { queryNode: QueryNode,
    queryLeaf: QueryLeaf };

//TODO: Mettre dans un css
const graphStyle = {};
const pageStyle = { width: "100%", height: "800px", backgroundColor: '#B8CEFF' };

const PlanGraphWithMetrics = (props) => {
    


    return (
        <div className="MainGraphWithMetrics" style={pageStyle}>
            <div className="Metrics">
            export:{props.stats.exportMetric}<br/>
                import:{props.stats.importMetric}<br/>
                cardinality:{props.stats.cardinalityMetric}<br/>
                cost:{props.stats.costMetric}<br/>
                coverage:{props.stats.coverageMetric}<br/>
                progression:{props.stats.progressionMetric}<br/>
            </div>

            <ReactFlow className='MainGraph' style={graphStyle} nodes={nodesInit} edges={edgesInit} nodeTypes={nodeTypes} onNodesChange={props.onNodesChange()}/>
            
        </div>
    )
}


//<ReactFlow className='MainGraph' edges={edges} nodes={nodes} onNodesChange={onNodesChange} nodeTypes={nodeTypes} style={graphStyle} fitView><Controls/></ReactFlow>

export default PlanGraphWithMetrics;