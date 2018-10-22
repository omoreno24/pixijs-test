import {Engine} from "../engine.js"
export class GameBase {
    constructor(width, height){
        this.engine = Engine.createEngine(width, height);
        this.stage = {};
        this.engine.init();
        
        this._gameName = Math.floor(Math.random() * 1000000);
    }
    
    init(){
        this.stage = this.engine.createScene(this);
        this.setup();
    }

    getName(){
        return this._gameName;
    }
}