import * as PIXI from "pixi.js"

const fullscreen = (elem)=>{
    console.log(elem);
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
          elem.msRequestFullscreen();
        }
}

const createStageSwitcher = (scenes) => {
    let id = "stage-switcher";
    let container = document.getElementById(id);
    if(container!=null)
        container.remove();

    container = document.createElement("div");
    container.id = id;
    container.style.position = "fixed";
    container.style.right = "10px";
    container.style.top = "10px";

    let i = 1;
    scenes.forEach(scene => {
        let elem = document.createElement("button"); 
        elem.type = "button";
        elem.textContent = `Stage ${i}`;
        elem.style.padding = "10px";
        elem.style.borderRadius = "99px";
        elem.style.backgroundColor = "white";
        elem.style.height = "60px";
        
        elem.addEventListener("click", ()=>{
            Engine.instance.showScene(scene);
        });

        container.appendChild(elem);
        i++;
    });
    document.body.appendChild(container);
}

export class Engine{

    constructor (width, height, fullscreen = true)
    {
        this.parameters= {
            screenConfig:{
                width: width,
                height: height,
                antialias: true,
                resolution: 2
            },
            fullscreen: fullscreen
        }
        this.app  = null;
        this.initialized;
        this.scenes = [];
        Engine.instance = this;
    }

    init() {
        if(this.initialized) return;

        this.app = new PIXI.Application(this.parameters.screenConfig);
        
        let app = this.app;
        
        var a = document.body.append(app.view);
        
        if(this.parameters.fullscreen){
            app.renderer.view.style.position = "absolute";
            app.renderer.view.style.display = "block";
            app.renderer.autoResize = true;
            app.renderer.resize(window.innerWidth, window.innerHeight);
            
            window.addEventListener("resize", () => app.renderer.resize(window.innerWidth, window.innerHeight));
        }

        this.initialized = true;
    }

    createScene(controller){
        let stage = new PIXI.Container();
        let scene = {controller: controller, stage: stage, tickers: [], intervals: []}; 
        
        this.scenes[controller.getName()] = scene;
        if(this.app.stage.children.length==0)
            this.app.stage.addChild(stage);     

        createStageSwitcher(this.scenes);
        return stage;
    }

    createFastStage(parentStage = null){
        let stage = new PIXI.particles.ParticleContainer();
        if(parentStage != null) parentStage.addChild(stage);
        return stage;
    }

    startGameLoop(controller, c){
        let ticker = new PIXI.ticker.Ticker();
        ticker.add(c);
        ticker.start();
        this.scenes[controller.getName()].tickers.push(ticker);
    }

    startInterval(controller, c, s= 1){
        let interval = setInterval(()=>{c(interval)}, s*1000);
        this.scenes[controller.getName()].intervals.push(interval);
        return interval;
    }

    getScreenInfo(){
        return Object.assign({}, this.app.screen);
    }

    static getScreenInfo(){
        return Object.assign({}, Engine.engineInstance.app.screen);
    }

    static createEngine(fullscreen = false, width = 0, height=0, ){
        return Engine.instance || new Engine(width, height, fullscreen);
    }

    showScene(scene){
        console.log(scene);
        
        let app =  Engine.instance.app;

        if(app.stage.children[0] == scene.stage) return;
        if(app.stage.children.length == 0)
        {
            console.log("activating scene at first");
            console.log(scene.stage);
            this.activateScene(scene);
            return;
        }

        this.destroyScene(this.getSceneByStage(app.stage.children[0]));
        this.activateScene(scene);
    }

    destroyScene(scene){
        this.destroyTickers(scene.tickers);
        this.destroyIntervals(scene.intervals);
        this.desactivateStage(scene);

        while(scene.stage.children.length > 0)
        {
            let child  = scene.stage.children.shift();
            scene.stage.removeChild(child);
            child.destroy();
        }
    }
    
    desactivateStage(scene)
    {
        scene.stage.visible = false;
        this.app.stage.removeChild(scene.stage);
    }

    destroyTickers(tickers){
        while(tickers.length > 0)
        {
            let ticker = tickers.shift();
            ticker.destroy();
        }
    }

    destroyIntervals(intervals){
        while(intervals.length > 0)
        {
            let interval = intervals.shift();
            clearInterval(interval);
        }
    }

    activateScene(scene){
        scene.stage.visible = true;
        this.app.stage.addChild(scene.stage);
        
        scene.controller.setup();
    }

    getSceneByStage(stage){
        let scenes = this.scenes; 
        let scene = null;

        let found = scenes.some((_scene)=>{
            if(_scene.stage == stage) 
            {
                scene = _scene
                return true;
            } 
        });

        if(found) return scene;
        
        return null;
    }
}



const fpsMeter = {
    nbFrames: 0,
    framerate: 0.0,
    elapsed: performance.now(),
    refresh: 500,
    domElement: document.createElement("div")
}

window.onload = load;

function load() {
    create();
}

function create() {
    fpsMeter.domElement.style.position = "fixed";
    fpsMeter.domElement.style.left = "0px";
    fpsMeter.domElement.style.top = "0px";
    fpsMeter.domElement.style.color = "red";
    fpsMeter.domElement.style.fontFamily = "monospace";
    fpsMeter.domElement.style.fontSize = '28px';
    document.body.appendChild(fpsMeter.domElement);

    setInterval(update, 1000.0 / 60);
    render();
} 

function update() {
    let engine = Engine.instance;
    let now = performance.now();
    let frameTime = now - engine.elapsed;
    let timeRatio = frameTime * 60 * 0.001;

    engine.elapsed = now;
} 

function render() {
    requestAnimationFrame(render);
    let now = performance.now();
    let frameTime = now - fpsMeter.elapsed;

    fpsMeter.nbFrames++;
    if (frameTime >= fpsMeter.refresh) {
        let framerate = 1000.0 * fpsMeter.nbFrames / frameTime;
        fpsMeter.domElement.innerHTML = "FPS: " + framerate.toFixed(2).toString();
        fpsMeter.elapsed = now;
        fpsMeter.nbFrames = 0;
    }
}
