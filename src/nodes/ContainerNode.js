import React, { useCallback, useState } from "react";
import { Handle } from "react-flow-renderer";
import './ContainerNode.css';

const ContainerNode = (props) => {

  /**
   * Toggles the focus of a node 
   * @param {*} node The focused HTML node 
   */
  const toggleNodeCollapse = (node) => {
    const section = node.getElementsByClassName("ContainedNode")[0].getElementsByClassName("QueryNode")[0].getElementsByClassName("DisplayData")[0];

    const isExpanded = section.getAttribute('data-expanded') === 'true';

    if(!isExpanded) {
      expandNode(section)
      node.classList.add("ContainerNodeFocused");
    } else {
      collapseNode(section);
      node.classList.remove("ContainerNodeFocused");
    }

  }

  //Shameless copy pasta from https://css-tricks.com/using-css-transitions-auto-dimensions/
  /**
   * Hides a section of a node
   * @param {*} element The section of the node to hide
   */
  function collapseNode(element) {

    // get the height of the element's inner content, regardless of its actual size
    var sectionHeight = element.scrollHeight;
        
    // temporarily disable all css transitions
    var elementTransition = element.style.transition;
    element.style.transition = '';
        
    // on the next frame (as soon as the previous style change has taken effect),
    // explicitly set the element's height to its current pixel height, so we 
    // aren't transitioning out of 'auto'
    requestAnimationFrame(function() {
    element.style.height = sectionHeight + 'px';
    element.style.transition = elementTransition;
          
    // on the next frame (as soon as the previous style change has taken effect),
    // have the element transition to height: 0
    requestAnimationFrame(function() {
        element.style.height = 0 + 'px';
      });
    });
        
    // mark the section as "currently collapsed"
    element.setAttribute('data-expanded', 'false');
  }
      
  /**
   * Expand a section of a node
   * @param {*} element The section of the node to display
   */
  function expandNode(element) {
      
    // get the height of the element's inner content, regardless of its actual size
    var sectionHeight = element.scrollHeight;
        
    // have the element transition to the height of its inner content
    element.style.height = sectionHeight + 'px';
        
    // mark the section as "currently not collapsed"
    element.setAttribute('data-expanded', 'true');
  }

  //Node double click event handler, triggers toggling of node focus
  const doubleClickHandler = (event) => {    

    const node = event.target;
    toggleNodeCollapse(node);

  }

  return (
      <div className="ContainerNode" id={props.childProps.id} xposition={props.childProps.xPos} yposition={props.childProps.yPos} onDoubleClick={(e) => {doubleClickHandler(e)}} tabIndex="0">
          <div className="ContainedNode">{props.content}</div>
      </div>
  );
}

export default ContainerNode;