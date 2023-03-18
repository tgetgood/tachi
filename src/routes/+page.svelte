<script>

  //TODO: Save current level and score to local storage

  import Answer from './Answer.svelte';

  const init = Symbol("init");
  const blink = Symbol("blink");
  const pause = Symbol("pause");
  const query = Symbol("query");
  const next = Symbol("next");
  const again = Symbol("again");

  // This might need to be adjusted by platform
  // TODO: How does one detect framerate from the browser API?
  // REVIEW: Should I just set this in miliseconds and let the system round it
  // to the nearest frame? That's probably the best way to do it. Need to test
  // that that gives us short enough display windows though.
  const minDelay = 4;
  const maxDelay = 60;
  const initDelay = 16;

  let height;
  let width;

  let state = init;

  let games = [];

  let correctCount = 0;

  // Difficulty level
  let level = 5;
  let delay = initDelay;
  let dickishness = 1;
  let score = 0;

  function correctDigits(a, b) {
    let out = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] == b[i]) {
        out += 1;
      }
    }
    return out;
  }

  function setsize(window) {
    height = window.innerHeight*.97;
    width = window.innerWidth*.97;
  }

  function onload(e) {
    setsize(e);
  }

  function onresize(e) {
    setsize(this);
  }

  function adjustLevel(number, guess) {
    const result = correctDigits(guess, number);

    if (result == number.length) {
      score += 100;
      delay = Math.max(minDelay, Math.ceil(delay*3/4));
      dickishness += 2;
    } else {
      score -= 100*(number.length - result)/number.length;
      delay = Math.min(maxDelay, Math.ceil(delay * 4/3));
      dickishness = Math.max(1, Math.floor(dickishness* (1/2 + result/(2*number.length))));
    }
    if (score >= 500) {
      level += 1;
      delay = initDelay;
      score = 0;
    } else if (score <= -800) {
      level -= 1;
      score = 300;
    }
  }

  function processResponse(games, guess, i) {
    const game = games[i];

    adjustLevel(game.number, guess);
    correctCount += correctDigits(guess, game.number);

    if (i == games.length - 1) {
      if (correctCount == games.reduce( (a,x) => a + x.number.length, 0)) {
        state = next;
      } else {
        state = again;
      }
    }
  }

  function playGame (games, n) {
    correctCount = 0;
    state = blink;

    if (n > 0) {
      requestAnimationFrame(() => playGame(games, n - 1));
    } else {
      for (let i = 0; i < games.length; i++) {
        games[i].queryEl.$set({
          onClose: g => processResponse(games, g, i)
        });
      }

      state = pause;

      setTimeout(() => {
        state = query;
        requestAnimationFrame(() => {
          for (let i = games.length - 1; i >= 0; i--) {
            games[i].queryEl.clear();
          }
        });
      }, 300);
    }
  }

  function pageListener (e) {
    if (e.key === ' ') {
      e.preventDefault();

      if (games.length == 0 || state == next) {
        games = genGame(level);
        correctCount = 0;
      };
      state = pause;
      setTimeout(() => playGame(games, delay), Math.random()*500+500);

    }
  }

  function jitter(max, x, d) {
    // REVIEW: Maybe this ought to be gaussian instead of uniform.
    return Math.max(-1*x, Math.min(max - x, (Math.random() - 1/2)*Math.pow(2, d)));
  }

  function genGame(level) {
    if (level <= 9) {
      return [genSimpleGame(level, width/2, height/2)];

    } else if (level <= 12) {
      console.warn("You are now in an unstable level. Try to have fun.");
      let games = [];
      for (let i = 9; i <= level; i++) {
        let y = height/2 - (level - 9)/2*100 + (level - i)*100;
        console.log(width/2, y)
        games.push(genSimpleGame(3, width/2, y));
      }
      return games;
    } else {
      throw("You've reached the highest level yet implemented. You win!");
    }
  }
  function genSimpleGame(level, x, y) {
    let l = Math.random() < dickishness/2048 ? level + 1 : level;

      let loc = {
        x: x + jitter(width, x, dickishness),
        y: y + jitter(height, y, dickishness)
      };

    let number = [];

    for(let i = 0; i < l; i++) {
       number.push(Math.floor(Math.random()*10).toString());
    }
    return {
      queryEl: null,
      number: number,
      guess: [],
      loc: loc
    };
  }

</script>

<svelte:window on:keypress={pageListener} use:onload on:resize={onresize}/>

<div style:height="{height}px" style:width="{width}px">
  {#each games as game}
    <Answer x={game.loc.x} y={game.loc.y}
            bind:this={game.queryEl}
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
</style>
