const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

let currentPlayer = 'X';

function sigmoid(x) {
  return 1.0 / (1 + Math.exp(-x));
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
  let move = Math.floor(Math.random() * 9);
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