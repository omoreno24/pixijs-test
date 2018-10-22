import {StackGame} from "./games/stackGame/stack-game"
import {TextToolGame} from "./games/textTool/text-game"
import {SpriteGame, ParticleGame} from "./games/particleGame/particle-game"

const GAME_WIDTH = 1600;
const GAME_HEIGHT = 900;

var games = [];


games.push(new StackGame(GAME_WIDTH, GAME_HEIGHT));
games.push(new TextToolGame(GAME_WIDTH, GAME_HEIGHT));
games.push(new ParticleGame(GAME_WIDTH, GAME_HEIGHT));

for(let i = 0; i < games.length; i++){
    games[i].init();
}