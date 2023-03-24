export const scores = {};

export function success({ level, time }) {
  if ( scores[level] === undefined ) {
    scores[level] = {
      bestTime: Number.POSITIVE_INFINITY,
      currentRun: 0
    };
  }

  const s = scores.level

  if (time < s.bestTime) {
    s.bestTime = time
  }

  s.currentRun += 1;
}

export function failure({ level, time }) {
}
