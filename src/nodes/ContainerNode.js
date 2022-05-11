import React, { useCallback, useState } from "react";
import { Handle } from "react-flow-renderer";
import './ContainerNode.css';

const ContainerNode = (props) => {

    //const [isSelected, setIsSelected] = useState(true);

    const doubleClickHandler = (event) => {    

        var section = event.target.getElementsByClassName("ContainedNode")[0].getElementsByClassName("QueryNode")[0].getElementsByClassName("DisplayData")[0];
        var isExpanded = section.getAttribute('data-expanded') === 'true';

        if(!isExpanded) {
          expandSection(section)
          event.target.classList.add("ContainerNodeFocused");
        } else {
          collapseSection(section);
          event.target.classList.remove("ContainerNodeFocused");
        }

        /*const targetedNode = event.target;
        const targetContainedNode = targetedNode.getElementsByClassName("ContainedNode")[0];
        const targetQueryNode = targetContainedNode.getElementsByClassName("QueryNode")[0];
        const targetDisplayData = targetQueryNode.getElementsByClassName("DisplayData")[0];
        setIsSelected(!isSelected);

        if(isSelected){
            targetedNode.classList.add("ContainerNodeFocused");
            targetDisplayData.classList.add("DisplayDataFocused");
        } else {
            targetedNode.classList.remove("ContainerNodeFocused");
            targetDisplayData.classList.remove("DisplayDataFocused");
        }*/

    }

    //Shameless copy pasta from https://css-tricks.com/using-css-transitions-auto-dimensions/
    function collapseSection(element) {
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
      
    function expandSection(element) {
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = element.scrollHeight;
        
        // have the element transition to the height of its inner content
        element.style.height = sectionHeight + 'px';
        
        // mark the section as "currently not collapsed"
        element.setAttribute('data-expanded', 'true');
    }

    return (
        <div className="ContainerNode" id={props.childProps.id} xposition={props.childProps.xPos} yposition={props.childProps.yPos} onDoubleClick={(e) => {doubleClickHandler(e)}} tabIndex="0">
            <div className="Label">{props.childProps.data.label}</div>
            <div className="ContainedNode">{props.content}</div>
        </div>
    );
}

export default ContainerNode;