import * as tot from './types';
import { canAccept } from './accept';
import { at, Bot as BotApi, Challenge as ChallengeApi } from 'apil';
import Play from './play';


export default class Bot {

  playStateUpdate: tot.RawPlayStateUpdate
  token: string
  api: BotApi
  challenge: ChallengeApi
  plays: Map<at.GameId, Play>
  
  constructor(token: string, playStateUpdate: tot.RawPlayStateUpdate) {
    this.token = token;
    let auth = { token };
    
    this.api = new BotApi(auth);
    this.challenge = new ChallengeApi(auth);
    this.plays = new Map();
    this.playStateUpdate = playStateUpdate;
    
  }

  async respondChallenge(id: at.ChallengeId, reason?: at.DeclineReason) {
    if (this.plays.size > 2) {
      if (!reason) {
        reason = 'later';
      }
    }
    if (!reason) {
      this.challenge.accept(id);
    } else {
      this.challenge.decline(id, reason);
    }
  }

  respondGameStart(id: at.GameId) {
    let play = new Play(this.token, id, this.playStateUpdate)

    play.play().then(() => {
      this.plays.delete(id);
    });

    this.plays.set(id, play);
  }
  
  async acceptChallenges(acceptOptions: tot.AcceptOptions,
                         timeout: number = 15 * tot.minutes) {

    let config = tot.acceptConfig(acceptOptions);
    
    let { abort,
          response } = await this.api.incomingEvents();

    response.on('data', data => {
      if (at.isGameStart(data)) {
        this.respondGameStart(data.game.id);
      } else if (at.isGameFinish(data)) {
        
      } else if (at.isChallenge(data)) {
        let reason = canAccept(data, config);
        this.respondChallenge(data.challenge.id, reason);
      }
    });

    await new Promise<void>(resolve => {
      setTimeout(() => {
        abort();
        resolve();
      }, timeout);
    });
  }
}
