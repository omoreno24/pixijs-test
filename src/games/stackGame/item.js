import * as PIXI from "pixi.js";
import * as PROJECTION from "pixi-projection";

export class Item {
    constructor(parent = null, itemProperties){
        var {position, tintColor, width, height, size} = itemProperties;
        let sprite = new PIXI.projection.Sprite2d(PIXI.Texture.WHITE);
        sprite.anchor.set(0.5, 0);
        sprite.tint = tintColor || 0;
        sprite.position.set(position.x || 0, position.y || 0);
        sprite.width = width || size || 50;
        sprite.height = height || size || 50;

        sprite.skew.set(size,size);
        this.sprite = sprite;
        
        if(parent!=null)
        {
            parent.addChild(this.sprite);
        }
    }
}