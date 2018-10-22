const path = require('path');

module.exports = {
  entry: {
    app:[
      './src/engine.js',
      './src/games/game-base.js',
      './src/games/stackGame/stack-game.js',
      './src/games/stackGame/item.js',
      './src/games/textTool/text-game.js',
      './src/games/textTool/text.js',
      './src/index.js'
    ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: "development"
};