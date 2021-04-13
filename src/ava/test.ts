import test from 'ava';

import { token } from './_conf';
import Bot from '../bot';
import { at } from 'apil';

test.cb.failing('accept challenge', t => {

  function playStateUpdate(gameFull: at.GameFull) {
    console.log(gameFull.state);
    return undefined;
  };
  
  let bot = new Bot(token, playStateUpdate);

  bot.acceptChallenges({});
  
  setTimeout(() => t.end('timeout'), 30000);
});
