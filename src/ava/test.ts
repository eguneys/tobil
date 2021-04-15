import test from 'ava';

import { token } from './_conf';
import Bot from '../bot';
import { at } from 'apil';

test.cb.failing('accept challenge', t => {

  function full(gameFull: at.GameFull) {
    console.log(gameFull);
    return Promise.resolve([]);
  };

  function state(gameState: at.GameState) {
    console.log(gameState);
    return Promise.resolve([]);
  }

  function chat(chatLine: at.ChatLine) {
    return Promise.resolve([]);
  }

  function abort(status: at.GameStatus) {
    return Promise.resolve();
  }
  
  let bot = new Bot(token, {full, state, chat, abort});

  bot.acceptChallenges({});
  
  setTimeout(() => t.end('timeout'), 30000);
});
