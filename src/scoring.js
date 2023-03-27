import { onMount } from 'svelte';

let scores = {};
let ls;

export function init() {
  onMount(() => {
    ls = localStorage;
    const stored = ls.serialisedScores;
    scores = stored ? JSON.parse(stored) : {};

  });
}

export function save() {
  ls.serialisedScores = JSON.stringify(scores);
}

const initDelay = 250;
const maxDelay = 2048;
const minDelay = 8;

export const gameState = { level: 5, delay: 250 };

export const delayBuckets = [
  {ms:   10, name: "1/100"},
  {ms:   20, name: "1/50"},
  {ms:   40, name: "1/25"},
  {ms:  100, name: "1/10"},
  {ms:  250, name: "1/4"},
  {ms:  500, name: "1/2"},
  {ms: 1000, name: "1"},
  {ms: 2000, name: "2"}
];

export const levels = [3,4,"5"];

export const S = Symbol("success")
export const F = Symbol("failure")

let runningScore = 0;

function getLevel(level) {
  if ( scores[level] === undefined ) {
    scores[level] = {
      bestTime: 5000,
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
  const { level } = attempt;

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
  const tally = delayBuckets.map(x => { return  {correct: 0, total: 0} })

  getLevel(level).log.map(([status, { delay }]) => {
    for (let i = 0; i < delayBuckets.length; i++) {
      if (delay < delayBuckets[i].ms && ( i === 0 || delay > delayBuckets[i - 1].ms )) {
        tally[i].total += 1;
        if (status === S) {
          tally[i].correct += 1;
        }
      }
    }
  });
  return tally;
}

// FIXME: These two functions only differ in the condition. 
export function cumulativeStats(level) {
  const bs = delayBuckets.map(x => { return {correct: 0, total: 0} })

  getLevel(level).log.map(([status, { delay }]) => {
    delayBuckets.map(({ms}, i) => {
      if (delay < ms) {
        bs[i].total += 1;
        if ( status === S ) {
          bs[i].correct += 1;
        }
      }
    });
  });
    
  return bs;
}

function bestConsistentTime(level) {
  const delays = scoresByDelay(getLevel(level));

  for (let i = 0; i < delays.length; i++) {
    if (delays[i].correct > 0 && delays[i].correct/delays[i].total > 0.8) {
      return delaysBuckets[i].ms;
    }
  }

  return initDelay
}

export function advance(level) {
  const s = getLevel(level);

  gameState.delay = bestConsistentTime(level)*Math.pow(3/4, s.currentRun);
  return gameState;
}
