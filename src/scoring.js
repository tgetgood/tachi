import { writable } from 'svelte/store';

export const schemaVersion = "2";

export const delayBuckets = [
  // FIXME: 10ms often doesn't display at all, even on 120 fps monitors. Why?
  // {ms:   10, name: "1/100"},
  {ms:   20, name: "1/50"},
  {ms:   40, name: "1/25"},
  {ms:  100, name: "1/10"},
  {ms:  250, name: "1/4"},
  {ms:  500, name: "1/2"},
  {ms: 1000, name: "1"}
];

export const diskLevels = [];

export const ringLevels = [];

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
    name: "6 digits",
    tokens: 1,
    digits: 6,
    initDelay: 250,
    advance: 10
  },
  {
    name: "7 digits",
    tokens: 1,
    digits: 7,
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
    name: "8 digits",
    tokens: 1,
    digits: 8,
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

export let scores = writable(levels.reduce((a, l) => {
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
    version: schemaVersion, // don't change versions unless you break compatibility.
    currentLevel: levels[0].name,
    levels: {}
  }));


export function guestimateFramerate(n, total, init) {
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

// Subscriptions
let levelsStats;
export let currentDelay, currentLevel;

scores.subscribe(x => {
  levelsStats = x.levels;
  currentLevel = x.currentLevel;
  currentDelay = x.levels[x.currentLevel].delay;
});

// logic

export function meta(level) {
  return levels.filter(x => x.name === level)[0];
}

export function stats(level) {
  return levelsStats[level];
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

export function adjustChallenge(c, n) {
  scores.update( x => {
    const success = c === n;

    const m = meta(x.currentLevel);
    const lstats = x.levels[x.currentLevel];
    const dstats = lstats.timeScores.filter(x => x.delay === lstats.delay)[0];

    // tuning parameters
    const levelUpThreshold = 5;
    const levelDownThreshold = -3;

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
      lstats.currentStreak -= 1 - c/n;
    }

    const minDelay = delayBuckets[0].ms;

    // Set difficulty for next game
    if (lstats.currentStreak > levelUpThreshold) {
      lstats.currentStreak = 0;
      if (lstats.delay <= Math.max(m.advance, minDelay)) {
        x.currentLevel = nextLevel(x.currentLevel);
      } else {
        lstats.delay = shiftDelay(lstats.delay, -1);
      }
    } else if (lstats.currentStreak < levelDownThreshold) {
      lstats.currentStreak = 0;
      lstats.delay = shiftDelay(lstats.delay, 1);
    }

    return x;
  });
}

// This file is becoming increasingly poorly named

// Simple vertical column layout
export function stack(width, height, {tokens}, _) {
  const elemh = 40;
  const coords = []

  for (let i = 0; i < tokens; i++) {
    coords.push([width/2, height/2 - tokens/2*elemh + (tokens - i)*elemh]);
  }
  return coords.reverse();
}

function jitter(max, x, d) {
  // REVIEW: Maybe this ought to be gaussian instead of uniform.
  return Math.max(-1*x, Math.min(max - x - 20, (Math.random() - 1/2)*Math.pow(2, d)));
}

// Randomly perturn the column
export function random(width, height, {tokens}, {difficulty}) {
  difficulty = difficulty || 5;
  const coords = stack(width, height, {tokens}, {});

  return coords.map(([x, y]) => {
    return [jitter(width, x, difficulty), jitter(height, y, difficulty)];
  });
}

export function ellipse(width, height, {tokens}, {difficulty}) {
  difficulty = difficulty || 3;

  const a = width/2 * 0.8 * difficulty/10;
  const b = height/2 * 0.8 * difficulty/10;

  const distance = 2 * Math.PI/tokens;

  const theta = Math.random() * distance;

  const coords = [];

  for (let i = 0; i < tokens; i++) {
    const angle = theta + i * distance;
    coords.push([a*Math.cos(angle) + width/2, b*Math.sin(angle) + height/2]);
  }
  return coords.reverse();
}
