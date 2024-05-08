const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

let currentPlayer = 'X';

const inputSize = 9;  // 9 spaces on the board
const hiddenSize = 10; // hidden layer
const outputSize = 9; // 9 possible moves

const weights = neuralNetwork(inputSize, hiddenSize, outputSize);  

function trainNetwork(trainingData, epochs) {
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (const { boardState, bestMove } of trainingData) {
      let boardInput = board.map(space => {
        if (space === 'X') return -1; 
        if (space === 'O') return 1;  
        return 0;                    
      }); 

      let bestMoveOneHot = Array(9).fill(0);
      bestMoveOneHot[bestMove] = 1;


      const { output } = forwardPropagation(boardInput, weights);

      const loss = categoricalCrossEntropyLoss(bestMoveOneHot, output);

      let outputError = crossEntropyDerivative(bestMoveOneHot, output); 
      let hiddenError = transpose(weights.hiddenToOutputWeights).map(row => dotProduct(row, outputError));
      const learningRate = 0.1;
      weights.hiddenToOutputWeights = weights.hiddenToOutputWeights.map((row, i) => 
        row.map((weight, j) => weight - learningRate * outputError[j] * hiddenLayer[i]) 
      );

      weights.inputToHiddenWeights = weights.inputToHiddenWeights.map((row, i) =>
        row.map((weight, j) => weight - learningRate * hiddenError[j] * sigmoidDerivative(hiddenLayer[i]) * boardInput[j])
      );
    }
  }
}


function sigmoid(x) {
  return 1.0 / (1 + Math.exp(-x));
}

function sigmoidDerivative(x) {
  return sigmoid(x) * (1 - sigmoid(x));
}

function crossEntropyDerivative(yTrue, yPred)  { 
  const output = [];  
  for(let i = 0; i < yTrue.length; i++) {  
    if(yTrue[i] === 1) {
      output.push(-1 /  yPred[i]);  
    } else {
      output.push(0); 
    }
  }
  return output;
}

function categoricalCrossEntropyLoss(yTrue, yPred) {
  if (yTrue.length !== yPred.length) {
    throw new Error('yTrue and yPred must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < yTrue.length; i++) {
    if (yTrue[i] === 1) {
      sum -= Math.log(yPred[i]);
    }
  }
  return sum;
}

function dotProduct(v1, v2) {
  return v1.reduce((acc, val, i) => acc + val * v2[i], 0);
}

function forwardPropagation(input, weights) {
  const hiddenLayer = weights.inputToHiddenWeights.map(row => sigmoid(dotProduct(row, input)));
  const output = weights.hiddenToOutputWeights.map(row => sigmoid(dotProduct(row, hiddenLayer)));
  return { hiddenLayer, output };
}

function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function generateMove(boardState, player) {
  for (let i = 0; i < 9; i++) {
    if (boardState[i] === ' ') {
      const testBoard = [...boardState];
      testBoard[i] = player;
      if (checkWin(testBoard)) return i; 
    }
  }

  for (let i = 0; i < 9; i++) {
    if (boardState[i] === ' ') {
      const testBoard = [...boardState]; 
      testBoard[i] = (player === 'X') ? 'O' : 'X';
      if (checkWin(testBoard)) return i; 
    }
  }

  if (boardState[4] === ' ') return 4;

  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(index => boardState[index] === ' ');
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  for (let i = 0; i < 9; i++) {
    if (boardState[i] === ' ') return i; 
  }
}

function generateTrainingData(numExamples) {
  const trainingData = [];
  for (let i = 0; i < numExamples; i++) {
    const boardState = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']; 
    let currentPlayer = 'X';

    while (!checkWin(boardState)) { 
      const move = generateMove(boardState, currentPlayer);
      boardState[move] = currentPlayer;
      trainingData.push({boardState: [...boardState], bestMove: move});
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
  }
  return trainingData;
}

function neuralNetwork(inputSize, hiddenSize, outputSize) {
  const inputToHiddenWeights = [];
  const hiddenToOutputWeights = [];

  for (let i = 0; i < hiddenSize; i++) {
    inputToHiddenWeights.push([]);
    for (let j = 0; j < inputSize; j++) {
      inputToHiddenWeights[i].push(Math.random());
    }
  }
  for (let i = 0; i < outputSize; i++) {
    hiddenToOutputWeights.push([]);
    for (let j = 0; j < hiddenSize; j++) {
      hiddenToOutputWeights[i].push(Math.random());
    }
  }

  return {
    inputToHiddenWeights,
    hiddenToOutputWeights
  };
}

function printBoard() {
  console.log('\n' +
    ' ' + board[0] + ' | ' + board[1] + ' | ' + board[2] + '\n' +
    ' ---------\n' +
    ' ' + board[3] + ' | ' + board[4] + ' | ' + board[5] + '\n' +
    ' ---------\n' +
    ' ' + board[6] + ' | ' + board[7] + ' | ' + board[8] + '\n'
  );
}

function checkWin() {
  const lines = [
    [board[0], board[1], board[2]],
    [board[3], board[4], board[5]],
    [board[6], board[7], board[8]],
    [board[0], board[3], board[6]],
    [board[1], board[4], board[7]],
    [board[2], board[5], board[8]],
    [board[0], board[4], board[8]],
    [board[2], board[4], board[6]]
  ];
  for (let line of lines) {
    if (line.every(val => val === 'X')) return 'X';
    if (line.every(val => val === 'O')) return 'O';
  }
  return null;
}

function iAMakeMove() {
  let boardInput = board.map(space => space === 'O' ? 1 : 0);

  const { output: moveProbabilities } = forwardPropagation(boardInput, weights);

  let move = moveProbabilities.indexOf(Math.max(...moveProbabilities)); 

  if (board[move] === ' ') {
    board[move] = currentPlayer;
    const winner = checkWin();
    if (winner) {
      printBoard();
      console.log(`IA wins!`);
      rl.close();
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      printBoard();
      makeMove();
    }
  } else {
    console.log('Invalid move, try again.');
    iAMakeMove();
  }
}

function makeMove() {
  rl.question(`${currentPlayer}, enter your move (0-8): `, (answer) => {
    const move = Number(answer);
    if (board[move] === ' ') {
      board[move] = currentPlayer;
      const winner = checkWin();
      if (winner) {
        printBoard();
        console.log(`Human wins!`);
        rl.close();
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        printBoard();
        iAMakeMove();
      }
    } else {
      console.log('Invalid move, try again.');
      makeMove();
    }
  });
}

printBoard();
currentPlayer === 'X' ? makeMove() : iAMakeMove();
const trainingData = generateTrainingData(500); 
const epochs = 100; 
trainNetwork(trainingData, epochs); 
