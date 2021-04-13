import * as tot from './types';
import { at } from 'apil';

export function canAccept({ challenge }: at.Challenge, config: tot.AcceptConfig): at.DeclineReason | undefined {
  if (config.ignores.includes(challenge.challenger.id)) {
    return 'generic';
  }
  if (!config.variants.includes(challenge.variant.key)) {
    return 'variant';
  }
  if (config.noRated && challenge.rated) {
    return 'rated'
  }
  if (config.noUnrated && !challenge.rated) {
    return 'casual';
  }
  if (!config.controls.includes(challenge.timeControl.show)) {
    return 'timeControl'
  }
}
