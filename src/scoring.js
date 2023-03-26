const initDelay = 250;
const maxDelay = 2048;
const minDelay = 8;

export const gameState = { level: 5, delay: 250 };
export const scores = {};

export const levels = [3,4,5];

let runningScore = 0;

const S = Symbol("success")
const F = Symbol("failure")


function getLevel(level) {
 if ( scores[level] === undefined ) {
    scores[level] = {
      bestTime: Number.POSITIVE_INFINITY,
      currentRun: 0,
      log: []
    };
  }

  return scores[level];
}

export function success(attempt) {
  const { level, delay } = attempt;

  const s = getLevel(level);

  s.log.push([S, attempt]);

  if (delay < s.bestTime) {
    s.bestTime = delay;
  }

  if (s.currentRun < 0) {
    s.currentRun = 1;
  } else {
    s.currentRun += 1;
  }

  // TODO: Find the shortest delay at which the player consistently gets 90%(?)
  // of answers correct. This should be a rolling average with a window of (???)
  // attempts. Maybe just take the last 15 and make sure that 4 out of each
  // third were correct?

  // TODO: Store the percentage of correct answers as a function of delay. Maybe
  // just break it down into >1s, > 1/2s, > 1/4s, 1/10, 1/25. 1/50, 1/100 (if
  // frame rate is high enough.
}

export function failure(attempt) {
  const { level, delay } = attempt;

  const s = getLevel(level);

  s.log.push([F, attempt]);

  if (s.currentRun > 0) {
    s.currentRun = -1;
  } else {
    s.currentRun -= 1;
  }

}

// REVIEW: is this a reasonable bucketing strategy?
export function scoresByDelay(level) {
  const s = getLevel(level);

  const tally = {}
  for (let i = 3; i < 12; i++) {
    const o = {}
    o[S] = 0;
    o[F] = 0;
    tally[i] = o;
  }

  return s.log.reduce((a, [status, { delay }]) => {
    if (delay > maxDelay || delay < minDelay) {
      return a;
    }

    const rank = Math.ceil(Math.log2(delay));
    a[rank][status] += 1;
    return a;

  }, tally);
}

export function ratio(x) {
  if (x[S] > 0) {
    return x[S] / ( x[S] + x[F] );
  } else {
      return 0;
  }
}

function bestConsistentTime(level) {
  const s = getLevel(level);
  if (s.log.length === 0) {
    return initDelay;
  }

  const delays = scoresByDelay(s);

  console.log(delays);

  for (let i = 3; i < 11; i++) {
    const win = delays[i][S];
    const loss = delays[i][F];
    if ( win > 0 && win / (win + loss) > 0.8) {
      return Math.pow(2, i)
    }
  }

  return initDelay
}

export function advance(level) {
  const s = getLevel(level);

  gameState.delay = bestConsistentTime(level)*Math.pow(3/4, s.currentRun);
  return gameState;
}
