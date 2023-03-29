<script>

  import Answer from './Answer.svelte';

  import * as Score from '../scoring.js';
  Score.init();

  // Crappy state machine. Good enough for now.
  const init = Symbol("init");
  const blink = Symbol("blink");
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

      Score.adjustChallenge(correctCount === total);

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
    state = blink;

    setTimeout(() => requestAnimationFrame(() => {
      state = pause

      setTimeout(() => {
        state = query;
        requestAnimationFrame(() => {
          games[0].queryEl.clear();
        });
      }, 800);
    }), n);

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
      games = genGame(Score.meta(level));
      correctCount = 0;

      state = pause;
      const stats = Score.stats(level);
      setTimeout(() => playGame(games, stats.delay), Math.random()*500+500);
    }
  }

  function jitter(max, x, d) {
    // REVIEW: Maybe this ought to be gaussian instead of uniform.
    return Math.max(-1*x, Math.min(max - x - 20, (Math.random() - 1/2)*Math.pow(2, d)));
  }

  function genGame({tokens, digits}) {
    const elemh = 40;
    let games = [];

    for (let i = 0; i < tokens; i++) {
      let y = height/2 - tokens/2*elemh + (tokens - i)*elemh;
      games.push(genSimpleGame(digits, width/2, y));
    }
    return games.reverse();
  }

  function genSimpleGame(level, x, y) {
    let number = [];

    for(let i = 0; i < level; i++) {
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
            blink={state == blink}
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

<footer> <a href="/stats">stats</a> </footer>

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
