import { at } from 'apil';

export const minutes = 1000 * 60;

export type AcceptConfig = {
  ignores: Array<at.UserId>,
  variants: Array<at.VariantKey>,
  noRated: boolean
  noUnrated: boolean
  controls: Array<at.TimeControlShow>
};

export type AcceptOptions = Partial<AcceptConfig>

const defaultConfig: AcceptConfig = {
  ignores: [],
  variants: ['standard'],
  noRated: false,
  noUnrated: false,
  controls: ['1+0', '3+0', '3+2', '5+0', '5+3', '10+0']
};

export function acceptConfig(opts: AcceptOptions): AcceptConfig {
  return {
    ...defaultConfig,
    ...opts
  };
}

export type PlayStateMove = at.Uci
export type PlayStateChat = {
  chat: string
}

export type PlayStateAction = PlayStateMove | PlayStateChat

export function isPlayStateMove(action: PlayStateAction): action is PlayStateMove {
  return (typeof action === 'string');
}

export interface RawPlayStateUpdate {
  full: (_: at.GameFull) => Promise<Array<PlayStateAction>>,
  state: (_: at.GameState) => Promise<Array<PlayStateAction>>,
  chat: (_: at.ChatLine) => Promise<Array<PlayStateAction>>,
  abort: (_: at.GameStatus) => Promise<void>
}

export interface PlayStateUpdate {
  move: (turn: at.Color, state: PlayState) => Promise<Array<PlayStateAction>>,
  chat: (_: at.ChatLine, state: PlayState) => Promise<Array<PlayStateAction>>,
  abort: (status: at.GameStatus, state: PlayState) => Promise<void>
}

export type PlayState = {
  pov: at.Color,
  opponent: at.User,
  initialTurn: at.Color,
  initialFen: at.Fen,
  moves: string,
  status: at.GameStatus
}
