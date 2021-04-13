import { at } from 'apil';
import * as tot from './types';

function fenTurn(fen: at.Fen) {
  if (fen === 'startpos') {
    return 'white';
  } else {
    let [_, color] = fen.split(' ');
    return color === 'w'? 'white':'black';
  }
}

function oppositeColor(color: at.Color) {
  return color === 'white' ? 'black' : 'white';
}

export function playStateUpdate(botId: string, playStateUpdate: tot.PlayStateUpdate): tot.RawPlayStateUpdate {

  let playState: tot.PlayState;
  
  function full(data: at.GameFull) {

    let pov: at.Color = (data.white.id === botId) ? 'white' : 'black',
    opponent = data[oppositeColor(pov)],
    initialTurn: at.Color = fenTurn(data.initialFen);
    
    playState = {
      pov,
      opponent,
      initialTurn,
      initialFen: data.initialFen,
      moves: data.state.moves
    };

    return Promise.resolve([]);
  }

  function state(data: at.GameState) {
    let evenTurn = (data.moves === '') || data.moves.split(' ').length % 2 === 0,
    turn = evenTurn ? playState.initialTurn : oppositeColor(playState.initialTurn);
    playState.moves = data.moves;
    
    return playStateUpdate.move(turn, playState);
  }

  function chat(chatLine: at.ChatLine) {
    return playStateUpdate.chat(chatLine, playState);
  }

  return {
    full,
    state,
    chat
  };
}
