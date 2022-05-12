import YASQE from 'yasgui-yasqe';
import React, { useState, useCallback, useEffect } from 'react';
import "yasgui-yasqe/dist/yasqe.min.css";


function YasqeEditor(props){

    var yasqe = props.yasqe;
    var [hasBeenInitialized, setHasBeenInitialized] = useState(false);
    
    //componentDidMount equivalent. It is used to create the yasqe editor once, when the page is loaded
    useEffect(() => {
        if(!hasBeenInitialized){
            hasBeenInitialized = true;
            yasqe = YASQE(document.getElementById("YasqeEditor"));
            yasqe.setValue(props.initialValue);
        }
    }, [])



    return(
        <div id="YasqeEditor">

        </div>
    )
}


export default YasqeEditor;