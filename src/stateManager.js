//This class is used to restreint user input. This prevents mistakes and inconsistent display of the progression of the query
export default class StateManager {


    //Possible states : preQuery, midQuery, waitForResponse, midAutoRun, postQuery
    #state;

    constructor(){
        this.#state = "preCommit";

    }

    getState(){
        return this.#state;
    }

    setState(newState){
        this.#state = newState;
    }

    canCommit(){
        return this.#state === "preCommit" || this.#state === "postQueryEnd";
    }

    canNext(){
        return this.#state === "betweenSteps";
    }

    canAutoRun(){
        return this.#state === "betweenSteps";
    }

    canStopAutoRun(){
        return this.#state === "autoRun";
    }

    canOffSetNext(){
        return this.#state = "betweenSteps";
    }

    isAutoRunOn(){
        return this.#state === "autoRun";
    }

}
