import { onMount } from 'svelte';
import * as Score from './scoring.js';

let ls = undefined;

function save(scores) {
  if (ls !== undefined) {
     ls.setItem('serialisedScores', JSON.stringify(scores));
  }
}

export function init() {
  onMount(() => {
    ls = window.localStorage;
    // boo('set', ls);

    const stored = ls.serialisedScores;

    if (stored === undefined) {
      return;
    }

    const revived = JSON.parse(stored);

    if (revived.version !== Score.schemaVersion) {
      // TODO: do some kind of quick diff to keep the parts of the saved state
      // that match the new schema. At the very least keep score.currentLevel so
      // long as that level still exists.
      console.error("schema mismatch, resetting game data!")
      ls.clear();
    } else {
      Score.scores.set(revived);
    }

    Score.guestimateFramerate(15, 15, Date.now());
  });
}

Score.scores.subscribe(x => {
  save(x);
});
