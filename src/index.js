import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import loseSound from "./fail.mp3";
import tieSound from "./draw.mp3";
import pindot from "./click.mp3";


function Square(props) {
    return (

        <button disabled={props.disableBtn}
            onClick={() => {props.onClick(); NagPindot(); } }
            className={props.class} 
            
            >
            {props.value}   
        </button>
    )
}



class Board extends React.Component {

    renderSquare(i){
            let isDisabled = false;
            if(this.props.squares[i] !== null){
                isDisabled = true;
            }
            return <Square 
                value={this.props.squares[i]}
                class={'square ' + this.props.squares[i]+'-class' }
                onClick={() => {this.props.onClick(i); } }
                disableBtn = {isDisabled}
                
                />;

    }
    render() {
        let status = this.props.statusToboard;
        
        return(
            <div>
                <h1>T I C - T A C - T O E</h1>
                <div className="status">{status}</div>
                <div className="board-container">
                    <div className="board-row">
                        {this.renderSquare(0)}
                        {this.renderSquare(1)}
                        {this.renderSquare(2)}
                    </div>
                    <div className="board-row">
                        {this.renderSquare(3)}
                        {this.renderSquare(4)}
                        {this.renderSquare(5)}
                    </div>
                    <div className="board-row">
                        {this.renderSquare(6)}
                        {this.renderSquare(7)}
                        {this.renderSquare(8)}
                    </div>
                </div>
            </div>
        );
    }
}

class Game extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            isDisabled: false,
        }
    }


    whoWillMove(i){
         const history = this.state.history.slice(0, this.state.stepNumber + 1);
         const current = history[history.length - 1];
         const squares = current.squares.slice();
         if(CalculateWinner(squares) || squares[i]){
            return Promise.resolve();
         }
         squares[i] = this.state.xIsNext ? "X" : "O";
         const nextState = {
            history: history.concat([
                {
                    squares: squares,
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
         };

         //when set state is complete return promise that resolve.
         return new Promise((resolve, reject) => {
            this.setState(nextState, resolve);
         });
    }

   async handleClick(i){

        //player move here
        await this.whoWillMove(i);


        //jarvis move here
        const squares = this.state.history[this.state.stepNumber].squares.slice();
        const bestMove = findBestSquare(squares, this.state.xIsNext ? "X" : "O");
        if(bestMove !== -1){
            await this.whoWillMove(bestMove)
        }

    }
    jumpTo(step){
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }
    
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = CalculateWinner(current.squares);
        
        const moves = history.map((step, move) =>{
            const desc = move ?
            'Go to move #'+ move :
            'Go to game start';

            let AImoveDisable;
            let textColor;
            move % 2 ? AImoveDisable = true : AImoveDisable = false;
            AImoveDisable ? textColor = 'text-color' : textColor = '';
            return(
                <li key={move}>
                    <button className={textColor} disabled = {AImoveDisable} onClick={() => {this.jumpTo(move);}}>{desc}</button>
                </li>
            );
        })
        let status;
        let reset;
        if(winner){
            
            if(winner === "O"){
                lose();
                status = 'You lose haha.';
                reset = <button onClick={()=> this.jumpTo(0)}>Play Again</button>
            }else{
                status= 'Wow you win.';
                reset = <button onClick={()=> this.jumpTo(0)}>Play Again</button>
            }
            
            
        }else if(current.squares.includes(null)){

           status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
           
        }else{
            draw();
            status = 'ITS A DRAW!';
            reset = <button onClick={()=> this.jumpTo(0)}>Play Again</button>
        }
        return(
            <div className="game">
                <div className="game-board">
                    <Board

                        statusToboard = {status}
                        squares={current.squares}
                        onClick={(i) => {this.handleClick(i);}}
                        aaa = {this.state.isDisabled}
                       
                    />
                <div className="reset">{reset}</div>
                </div>
                <div className="game-info">
                    <div className="status-info">{status}</div>
                    <p>Cannot go back with red color.</p>
                    <ol>{moves}</ol>
                </div>
            </div>
        )
    }

}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game/>);


function CalculateWinner(squares){
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for(let i = 0; i < lines.length; i++){
        const [a, b, c] = lines[i];
        if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
            return squares[a];
            
        }
    }
    return null;
}

function isBoardFilled(squares){
    for(let i = 0; i < squares.length; i++){
        if(squares[i] === null){
            return false;
        }
    }
    return true;
}

function findBestSquare(squares, player) {
    // 'player' is the maximizing player
    // 'opponent' is the minimizing player
    const opponent = player === 'X' ? 'O' : 'X';
    
    const minimax = (squares, isMax) => {
      const winner = CalculateWinner(squares);
      
      // If player wins, score is +1
      if (winner === player) return { square: -1, score: 1 };
      
      // If opponent wins, score is -1
      if (winner === opponent) return { square: -1, score: -1 };
      
      // If Tie, score is 0
      if (isBoardFilled(squares)) return { square: -1, score: 0 };
      
      // Initialize 'best'. If isMax, we want to maximize score, and minimize otherwise.
      const best = { square: -1, score: isMax ? -1000 : 1000 };
      
      // Loop through every square on the board
      for (let i = 0; i < squares.length; i++) {
        // If square is already filled, it's not a valid move so skip it
        if (squares[i]) {
          continue;
        }
        
        // If square is unfilled, then it's a valid move. Play the square.
        squares[i] = isMax ? player : opponent;
        // Simulate the game until the end game and get the score,
        // by recursively calling minimax.
        const score = minimax(squares, !isMax).score;
        // Undo the move
        squares[i] = null;
  
        if (isMax) {
          // Maximizing player; track the largest score and move.
          if (score > best.score) {
            best.score = score;
            best.square = i;
          }
        } else {
          // Minimizing opponent; track the smallest score and move.
          if (score < best.score) {
            best.score = score;
            best.square = i;
          }
        }
      }
      
      // The move that leads to the best score at end game.
      return best;
    };
    
    // The best move for the 'player' given current board
    return minimax(squares, true).square;
  }

  function lose(){
    new Audio(loseSound).play();
  }

  function draw(){
    new Audio(tieSound).play();
  }
  function  NagPindot(){
    new Audio(pindot).play();
  }