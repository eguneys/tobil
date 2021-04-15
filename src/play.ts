import * as tot from './types';
import { at, Bot as BotApi } from 'apil';

export default class Play {

  gameId: at.GameId
  abort?: () => void
  gameFull?: at.GameFull
  stateUpdate: tot.RawPlayStateUpdate
  api: BotApi

  constructor(token: string, id: at.GameId, stateUpdate: tot.RawPlayStateUpdate) {
    let auth = { token };

    this.gameId = id;
    this.api = new BotApi(auth);

    this.stateUpdate = stateUpdate;
  }

  async processActions(actions: Array<tot.PlayStateAction>) {
    await Promise.all(actions.map(_ => {
      if (tot.isPlayStateMove(_)) {
        return this.move(_);
      } else {
        return this.chat(_.chat);
      }
    }))
  }

  async respondGameChat(data: at.ChatLine) {
    let actions = await this.stateUpdate.chat(data);
    await this.processActions(actions);
  }

  async respondGameFull(data: at.GameFull) {
    this.gameFull = data;

    let actions = await this.stateUpdate.full(this.gameFull);

    await this.processActions(actions);
    
    this.respondGameState(this.gameFull.state);
  }
  
  async respondGameState(state: at.GameState) {
    if (!this.gameFull || state.status !== 'started') {
      this.respondGameAbort(state.status);
      return;
    }

    this.gameFull.state.moves = state.moves;

    let actions = await this.stateUpdate.state(state);

    await this.processActions(actions);
  }

  async respondGameAbort(status: at.GameStatus) {
    await this.stateUpdate.abort(status);
    this.abort?.();
  }

  move(uci: at.Uci, offeringDraw?: boolean) {
    return this.api.move(this.gameId, uci, offeringDraw)
      .catch(_ => console.error(`Move fail ${uci} : ${_}`));
  }

  chat(chat: string) {
    return this.api.chat(this.gameId, "player", chat)
      .catch(_ => console.error(`Chat fail ${chat} : ${_}`));
  }

  async play(timeout: number = 15 * tot.minutes) {
    let { abort,
          response } = await this.api.gameState(this.gameId);

    response.on('data', data => {
      if (at.isGameFull(data)) {
        this.respondGameFull(data);
      } else if (at.isGameState(data)) {
        this.respondGameState(data);
      } else if (at.isChatLine(data)) {
        this.respondGameChat(data);
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
