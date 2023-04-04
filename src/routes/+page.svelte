<script>

  import Answer from './Answer.svelte';

  import * as Score from '../scoring.js';

  // Crappy state machine. Good enough for now.
  const init = Symbol("init");
  const pause = Symbol("pause");
  const query = Symbol("query");
  const next = Symbol("next");
  const again = Symbol("again");

  let state = init;

  // All delays are in milliseconds, but in reality they get rounded up to the
  // next frame (best case).

  let height;
  let width;

  let games = [];

  let correctCount = 0;

  function setsize(window) {
    height = window.innerHeight - 50;
    width = window.innerWidth - 16;
  }

  function onload(e) {
    setsize(e);
  }

  function onresize(e) {
    setsize(this);
  }

  function finished(game) {
    return game.guess.every(x => x !== "");
  }

  function nextUnfinished(games, i) {
    const n = games.length
    for (let j = i + 1; j % n != i; j++) {
      const k = j % n;
      if (!finished(games[k])) {
        return k;
      }
    }
    return -1
  }

  function correctDigits(a, b) {
    let out = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] == b[i]) {
        out += 1;
      }
    }
    return out;
  }

  function processResponse(games, i) {
    const game = games[i];

    const cont = nextUnfinished(games, i);

    if (cont == -1) {
      const total = games.reduce((a, x) => a + x.number.length, 0);
      correctCount = games.reduce(
        (a, x) => a + correctDigits(x.guess, x.number),
        0
      );

      Score.adjustChallenge(correctCount, total);

      if ( correctCount === total ) {
        state = next;
      } else {
        state = again;
      }
    } else {
      games[cont].queryEl.clear();
    }
  }

  function playGame (games, n) {
    correctCount = 0;

    const wait = Math.random() * 500 + 700;
    const flashDuration = Score.currentDelay();
    const afterDelay = 800; // arbitrary

    games.map(x => x.queryEl.flash(wait, flashDuration));

    setTimeout(() => {
      state = query;
      requestAnimationFrame(() => {
        games[0].queryEl.clear();
      });
    }, wait + afterDelay + flashDuration);

    for (let i = 0; i < games.length; i++) {
      games[i].queryEl.clear();
      games[i].queryEl.$set({
        onClose: () => processResponse(games, i)
      });
    }
  }

  function pageListener (e) {
    if (e.key == ' ') {
      e.preventDefault();

      const level = Score.scores.currentLevel;
      const stats = Score.stats(level);

      games = genGame(Score.meta(level), stats);
      correctCount = 0;

      state = pause;

      requestAnimationFrame(() => playGame(games, stats.delay));
    }
  }

  function genGame(level, progress) {
    let {tokens, digits, layoutFn} = level;
    layoutFn = layoutFn || Score.stack;

    return layoutFn(width, height, level, progress).map(([x, y]) =>
      genSimpleGame(digits, x, y));
  }

  function genSimpleGame(digits, x, y) {
    let number = [];

    for(let i = 0; i < digits; i++) {
       number.push(Math.floor(Math.random()*10).toString());
    }

    return {
      queryEl: null,
      number: number,
      guess: number.map(x => ""),
      loc: {x, y}
    };
  }

</script>

<svelte:window on:keypress={pageListener} use:onload on:resize={onresize}/>

<div style:height="{height}px" style:width="{width}px">
  {#each games as game}
    <Answer x={game.loc.x} y={game.loc.y}
            bind:this={game.queryEl}
            bind:guess={game.guess}
            number={game.number}
            answer={state == query}
            />
  {/each}
  <div id=instructions>

    <div style:display={state == query ? 'block' : 'none'}>
      Do you remember the numbers you just saw?
    </div>

    <div style:display={state == init ? 'block' : 'none'}>
      Press [Spacebar] to begin
    </div>

    <div style:display={state == next ? 'block' : 'none'}>
      Correct!
    </div>
    <div style:display={state == next ? 'block' : 'none'}>
      Press [Spacebar] continue
    </div>

    <div style:display={state == again ? 'block' : 'none'}>
      {correctCount}/{games.reduce( (a, x) => a + x.number.length, 0)} correct
    </div>
    <div style:display={state == again ? 'block' : 'none'}>
      Press [Spacebar] to try again
    </div>
  </div>
</div>

<footer> <a href="stats">stats</a> </footer>

<style>
  #instructions {
    height: 100%;
    width: 100%;
    display: flex;
    column-gap: 2em;
    flex-direction: column;
    justify-content: end;
    align-items: center;
  }

  footer {
    padding-left: 1em;
    padding-bottom: 5px;
  }

  footer a {
    text-decoration: none;
    color: #555;
    font-size: x-large;
  }
</style>
