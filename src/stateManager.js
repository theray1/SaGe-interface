
class StateManager {


    //Possible states : preQuery, midQuery, waitForResponse, midAutoRun, postQuery
    #state;

    constructor(){
        this.#state = "preQuery";
    }

    getState(){
        return this.#state;
    }

    setState(newState){
        this.#state = newState;
    }

    //Start -> 
    commitQuery(){
        if(this.getState() === "preQuery"){
            this.setState("waitForResponse");
            return true;
        }
        return false;
    }

    startAutoRun(){
        if(this.getState() === "preQuery"){
            this.setState("midAutoRun");
            return true;
        }
        return false;
    }

    commitNextQuantum(){
        if(this.getState() === "midQuery"){
            this.setState("waitForResponse");
            return true;
        }
        return false;
    }

    resumeAutoRun(){
        if(this.getState() === "midQuery"){
            this.setState("midAutoRun");
            return true;
        }
        return false;
    }

    receiveResponse(){
        if(this.getState() === "waitForResponse"){
            this.setState("midQuery");
            return true;
        }
        return false;
    }

    receiveFinalResponse(){
        if(this.getState() === "waitForResponse" && this.getState() === "midAutoRun"){
            this.setState("postQuery");
            return true;
        }
        return false;
    }

    stopAutoRun(){
        if(this.getState() === "midAutoRun"){
            this.setState("midQuery");
            return true;
        }
        return false;
    }



}
