//This class is used to restreint user input. This prevents mistakes and inconsistent display of the progression of the query
export default class StateManager {

    #state;

    possibleStates = ["preQuery", "midQuery", "postQueryEnd", "betweenSteps", "autoRun", "offSet"];

    constructor(){
        this.#state = "preCommit";
    }

    getState(){
        return this.#state;
    }

    setState(newState){
        if(this.possibleStates.includes(newState)) this.#state = newState;
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

    canEnterOffSetMode(){
        return this.#state === "betweenSteps";
    }

    canLeaveOffSetMode(){
        return this.#state === "offSet";
    }

    canOffSet(){
        return this.#state === "offSet";
    }

    isAutoRunOn(){
        return this.#state === "autoRun";
    }

}
