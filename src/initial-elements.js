
import position from 'dagre/lib/position';
import React from 'react';
import { MarkerType } from 'react-flow-renderer';
import QueryStepNode from './QueryStepNode';

const defaultPosition = { x: 0, y: 0}; 

export const nodesInit = [
  {
    id: "1",
    type: 'queryStepNode',
    data: {
      label: "Test node 1",
      progress: "1",
      nodetype: "Selection"

    },
    position: defaultPosition
  },
  {
    id: "2",
    type: 'queryStepNode',
    data: { 
      label: "Test node 2",
      progress: "100",
      nodetype: "Join"
    },
    position: defaultPosition
  },
  {
    id: "3",
    type: 'queryStepNode',
    data: { 
      label: "Test node 3",
      progress: "50",
      nodetype: "Limit"
    },
    position: defaultPosition
  },
  {
    id: "4",
    type: 'queryStepNode',
    data: {
      label: "Default Node",
      progress: "0",
      nodetype: "idk"
    },
    position: defaultPosition
  }
];

export const edgesInit = [
  {
    id: "e2-1",
    source: "2",
    target: "1",
    type: "default",
    animated: true
  },

  {
    id: "e3-1",
    source: "3",
    target: "1",
    type: "default",
    animated: true
  },
  {
    id: "e4-3",
    source: "4",
    target: "3",
    type: "default",
    animated: true
  }
];