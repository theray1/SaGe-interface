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

const nodeTypes = { queryNode: QueryNode,
    queryLeaf: QueryLeaf };

//TODO: Mettre dans un css
const graphStyle = { backgroundColor: '#B8CEFF' };
const pageStyle = { width: "100%", height: "800px" };

function PlanGraphWithMetrics(props, nodes, edges, onNodesChange){
    


    return (
        <div className="MainGraphWithMetrics" style={pageStyle}>
            <div className="Metrics">
                export:{props.exportMetric}<br/>
                import:{props.importMetric}<br/>
                cardinality:{props.cardinalityMetric}<br/>
                cost:{props.costMetric}<br/>
                coverage:{props.coverageMetric}<br/>
                progression:{props.progressionMetric}<br/>
            </div>


            
        </div>
    )
}


//  <ReactFlow className='MainGraph' edges={edges} nodes={nodes} onNodesChange={onNodesChange} nodeTypes={nodeTypes} style={graphStyle} fitView><Controls/></ReactFlow>

export default PlanGraphWithMetrics;