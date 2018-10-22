import { GameBase } from '../game-base';
import {Item} from './item';
import  *  as Rainbow from 'rainbowvis.js';
import { Engine } from '../../engine';

const hexStringToNumber = (hexString)=> {
    return  parseInt(hexString.replace(/^#/, ''), 16);
}

class StackJob{
    constructor(item, targetPosition, done = false){
        this.item = item;
        this.targetPosition = targetPosition;
        this.done = done;
    }
}
let time = [];
export class StackGame extends GameBase {
    constructor(w, h, stackGameProperties= {}){
        super(w, h);

        let {width, height} = this.engine.getScreenInfo();
        let {stackSize, stackSeparation, itemSize} = stackGameProperties;

        this.width = width;
        this.height = height;
        this.stackSize = stackSize || 120;
        this.itemSize = itemSize || (height / (this.stackSize * 0.6)); // - this.stackSeparation;
        this.stackSeparation = stackSeparation || - (this.itemSize * 0.5); //-itemSize / 2;
    }

    setup(){
        let {stackSize, stackSeparation, itemSize} = this;
        this.stack  = [];
        this.workingStack = [];
        this.workingIndex = this.stackSize;
        this.stackStage = {};

        let stage = this.engine.createFastStage(this.stage);
        this.stackStage = stage;
        let rainbow = new Rainbow();

        rainbow.setNumberRange(0, stackSize);
        rainbow.setSpectrum("red","blue");
        
        let itemPropertiesDeff = {
            position:{
                x:0,
                y:0
            },
            tintColor:0xff0000,
            width: this.itemSize,
            height: this.itemSize
        };

        for(let i = 0; i < stackSize; i++){
            let color =  rainbow.colorAt(stackSize - i);
            let itemProperties = Object.assign({}, itemPropertiesDeff);

            itemProperties.position.x = (this.width / 3) - (0.5 * itemProperties.width);
            itemProperties.position.y = this.height - (((itemProperties.height + stackSeparation) * i) + (itemSize));
            itemProperties.tintColor = hexStringToNumber(color);

            let item = new Item(stage, itemProperties);
            this.stack.push(item);
        }

        this.engine.startInterval(this, (interval)=>{
            this.updateWorkingArray(interval);
        });
        
        
        this.engine.startGameLoop(this, this.gameLoop.bind(this));
    }

    updateWorkingArray(interval)
    {
        this.workingIndex -=1;  
        
        if(this.workingIndex < 0) { 
            clearInterval(interval); 
            return;
        }  
        
        this.insertJob(this.workingIndex);
    }

    gameLoop(delta)
    {
        this.moveWorkingItems(delta);
    }

    moveWorkingItems(delta){
        for(let i = 0; i < this.workingStack.length; i ++)
        {
            let t = time[i] + 2 * delta/200;
            if(t>1)
                t =1;
            
            time[i]= t;
            let itemjob= this.workingStack[i];
            
            if(itemjob.done) continue;
            let screenInfo = this.engine.getScreenInfo();
            let lerp1 = this.positionLerp({x:itemjob.item.position.x, y: itemjob.item.position.y/1.2},itemjob.targetPosition,t)
            let newPos = this.positionLerp(itemjob.item.position, lerp1, t);
            
            itemjob.item.position.set(newPos.x, newPos.y);

            if(Math.round(newPos.x) == Math.round(itemjob.targetPosition.x) && Math.round(newPos.y)== Math.round(itemjob.targetPosition.y))
                itemjob.done = true;
        }
    }

    insertJob(index){
        let stackJob = new StackJob(this.stack[index].sprite, this.getTargetPosition(index));
        this.workingStack.push(stackJob);
        time[this.workingStack.length-1] = 0;
        this.updateZIndex(stackJob.item);
    }

    updateZIndex(item){
        this.stackStage.setChildIndex(item, this.getReflectionIndex(this.workingIndex));
    }

    getReflectionIndex(index){
        let reflectedIndex  = this.stackSize - (index+1);
        return reflectedIndex;
    }

    getTargetPosition(index){
        let x = ((this.width / 3)*2) - (0.5 * this.itemSize);
        let y = this.height - (((this.itemSize + this.stackSeparation) * ((this.stackSize - index)-1)) + (this.itemSize));
        
        return {x:x, y:y};
    }

    positionDiference(A, B){
        return {x: A.x - B.x,y: A.y - B.y};
    }

    positionLerp(from, to, time){
        let x = this.lerp(from.x, to.x, time);
        let y = this.lerp(from.y, to.y, time);
        
        return {x:x, y:y};
    }

    lerp(a, b, t){
        return (1 - t) * a + t * b;
    }
}