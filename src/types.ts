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
