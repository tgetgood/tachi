import { onMount } from 'svelte';

const schemaVersion = "1";

export const delayBuckets = [
  {ms:   10, name: "1/100"},
  {ms:   20, name: "1/50"},
  {ms:   40, name: "1/25"},
  {ms:  100, name: "1/10"},
  {ms:  250, name: "1/4"},
  {ms:  500, name: "1/2"},
  {ms: 1000, name: "1"}
];

// REVIEW: Do I need these?
const minDelay = delayBuckets.map(x => x.ms).reduce((a, x) => Math.min(a, x));
const maxDelay = delayBuckets.map(x => x.ms).reduce((a, x) => Math.max(a, x));

export const levels = [
  {
    name: "3 digits",
    tokens: 1,
    digits: 3,
    initDelay: 100,
    advance: 10
  },
  {
    name: "4 digits",
    tokens: 1,
    digits: 4,
    initDelay: 100,
    advance: 10
  },
  {
    name: "5 digits",
    tokens: 1,
    digits: 5,
    initDelay: 100,
    advance: 10
  },
  {
    name: "2 x 3 digits",
    tokens: 2,
    digits: 3,
    initDelay: 100,
    advance: 10
  },
  {
    name: "6",
    tokens: 1,
    digits: 6,
    initDelay: 250,
    advance: 10
  },
  {
    name: "7",
    tokens: 1,
    digits: 6,
    initDelay: 500,
    advance: 10
  },
  {
    name: "2 x 4 digits",
    tokens: 2,
    digits: 4,
    initDelay: 500,
    advance: 10
  },
  {
    name: "8",
    tokens: 1,
    digits: 3,
    initDelay: 500,
    advance: 40
  },
  {
    name: "3 x 3 digits",
    tokens: 3,
    digits: 3,
    initDelay: 500,
    advance: 10
  },
  {
    name: "9",
    tokens: 1,
    digits: 9,
    initDelay: 500,
    advance: 100
  }
];

export let scores = levels.reduce((a, l) => {
  a.levels[l.name] = {
    currentStreak: 0,
    delay: l.initDelay,
    bestTime: 5000, // 5s is infinity for us.
    timeScores: delayBuckets.map(({ms}) => {
      return {
        delay: ms,
        correct: 0,
        tries: 0
      };
    })
  };
  return a;
  }, {
    // game metadata
    version: "1", // don't change versions unless you break compatibility.
    currentLevel: levels[0].name,
    levels: {}
  });

let ls;

function guestimateFramerate(n, total, init) {
  if (n > 0) {
    requestAnimationFrame(() => guestimateFramerate(n-1, total, init));
  } else {
    const deltaT = Date.now() - init;
    const frame = deltaT/total;
    console.log(Math.floor(1000/frame), "fps monitor detected.")
    while (delayBuckets[0].ms < frame) {
      // Don't reduce display time below what the monitor can manage
      delayBuckets.splice(0, 1);
    }
  }
}

export function save() {
  ls.serialisedScores = JSON.stringify(scores);
}
export function init() {
  onMount(() => {
    ls = localStorage;
    const stored = ls.serialisedScores;

    if (stored === undefined) {
      save();
      return;
    }

    const revived = JSON.parse(stored);

    if (revived.version !== schemaVersion) {
      ls.clear();
      save();
    } else {
      scores = revived;
    }

    guestimateFramerate(15, 15, Date.now());
  });
}

export function currentDelay() {
  return scores.levels[scores.currentLevel].delay;
}

export function meta(level) {
  return levels.filter(x => x.name === level)[0];
}

export function stats(level) {
  return scores.levels[level];
}

function nextLevel(level) {
  const i = levels.map(x => x.name).indexOf(level);

  if (i === -1 || i === levels.length) {
    throw("No more levels implemented. Congrats, you win!");
  }

  return levels[i+1].name;
}

function shiftDelay(delay, delta) {
  const i = delayBuckets.map(x => x.ms).indexOf(delay) + delta;

  if (i < 0) {
    return delayBuckets[0].ms;
  } else if (delayBuckets.length <= i) {
    return delayBuckets[delayBuckets.length - 1].ms;
  } else {
    return delayBuckets[i].ms;
  }
}

export function adjustChallenge(success) {
  const level = scores.currentLevel;
  const m = meta(level);
  const lstats = stats(level);
  const dstats = lstats.timeScores.filter(x => x.delay === lstats.delay)[0]

  // Record result of last game

  dstats.tries += 1;
  if (success) {
    dstats.correct += 1;

    if (lstats.delay < lstats.bestTime) {
      lstats.bestTime = lstats.delay;
    }
  }

  // REVIEW: This whole idea of a streak comes about from the intuition that
  // once you get 4 in a row or 80% or some such metric, then you've "got it"
  // and are ready to move on.
  //
  // Is that the right way to think about it? What about more traditional XP
  // gained by getting answers and then your level is ~sqrt(XP)? The problem
  // with that is that you can be right one time in a million and just grind it
  // out, which is not the point.
  //
  // So I guess the real difficulty is "how do you programmatically measure
  // learning?" dammit I'm writing a standardised test...

  // TODO: Consider measuring in rounds of N and requiring more than x% correct,
  // or more than p% correct n times, or some such variation.
  if (success) {
    lstats.currentStreak += 1;
  } else {
    lstats.currentStreak -= 1;
  }

  // Set difficulty for next game
  if (lstats.currentStreak > 3) {
    lstats.currentStreak = 0;
    if (lstats.delay <= m.advance) {
      scores.currentLevel = nextLevel(level);
    } else {
      lstats.delay = shiftDelay(lstats.delay, -1);
    }
  } else if (lstats.currentStreak < -5) {
    lstats.currentStreak = 0;
    lstats.delay = shiftDelay(lstats.delay, 1);
  }

  // Persist progress
  save();
}
