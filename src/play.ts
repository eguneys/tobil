import * as tot from './types';
import { at, Bot as BotApi } from 'apil';

export type PlayStateUpdate = (_: at.GameFull) => at.Uci | undefined

export default class Play {

  gameId: at.GameId
  abort?: () => void
  gameFull?: at.GameFull
  stateUpdate: PlayStateUpdate
  api: BotApi

  constructor(token: string, id: at.GameId, stateUpdate: PlayStateUpdate) {
    let auth = { token };

    this.gameId = id;
    this.api = new BotApi(auth);

    this.stateUpdate = stateUpdate;
  }

  respondGameState(state: at.GameState) {
    if (!this.gameFull || state.status !== 'started') {
      this.abort?.();
      return;
    }

    this.gameFull.state.moves = state.moves;

    let uci = this.stateUpdate(this.gameFull);

    if (uci) {
      this.move(uci);
    }
  }

  move(uci: at.Uci, offeringDraw?: boolean) {
    this.api.move(this.gameId, uci, offeringDraw);
  }

  async play(timeout: number = 15 * tot.minutes) {
    let { abort,
          response } = await this.api.gameState(this.gameId);

    response.on('data', data => {
      if (at.isGameFull(data)) {
        this.gameFull = data;
        this.respondGameState(data.state);
      } else if (at.isGameState(data)) {
        this.respondGameState(data);
      } else if (at.isChatLine(data)) {
        
      }
    });

    await new Promise<void>(resolve => {
      this.abort = () => {
        abort();
        resolve();
      };
      setTimeout(() => {
        abort();
        resolve();
      }, timeout);
    });
  }
  
}
