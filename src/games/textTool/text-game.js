import { GameBase } from '../game-base';
import { SpecialText } from './text';

export class TextToolGame extends GameBase{
    constructor(w, h, stackGameProperties = {}){
        super(w, h);
    }

    setup(){
        //setInterval(this.generateRandomText,2000);
    }
    
    generateRandomText()
    {
        let specialText = new SpecialText("HelloWorld ");

        this.stage.addChild(specialText);
    }
}