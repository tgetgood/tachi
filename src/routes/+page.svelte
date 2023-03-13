<script>

  import Answer from './Answer.svelte';

  const init = Symbol("init");
  const blink = Symbol("blink");
  const pause = Symbol("pause");
  const query = Symbol("query");
  const next = Symbol("next");
  const again = Symbol("again");

  // This might need to be adjusted by platform
  let minFrames = 4;

  let state = init;

  let number = [];
  let height;
  let width;

  let queryEl;
  let games = [];

  // Difficulty level (number of digits to display)
  let level = 4;
  let score = 1500;

  let guess = [];
  $: correctCount = correctDigits(guess, number);

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

  function resetGame() {
  }

  function adjustLevel(number, guess) {
    const result = correctDigits(guess, number);

    if (result == number.length) {
      score += 100;
    } else {
      score = Math.max(0, score - (number.length - result)*5);
    }
    console.log(score);
  }

  function playGame (n) {
      state = blink;

      if (n > 0) {
        requestAnimationFrame(() => playGame(n - 1));
      } else {
        queryEl.$set({
          onClose: g => {
            adjustLevel(number, g);
            guess = g;
            if (correctDigits(g, number) == number.length) {
              state = next;
            } else {
              state = again;
            }
          }
        });
          
        state = pause;

        setTimeout(() => {
          state = query;
          requestAnimationFrame(() => queryEl.clear());
        }, 300);
      }
  }

  function pageListener (e) {
    if (e.key === ' ') {
      e.preventDefault();

      if (number.length == 0 || state == next) {
        number = genGame(score);
      };
      state = pause;
      setTimeout(() => playGame(minFrames), Math.random()*500+500);
    }
  }

  function gameLevel(score) {
    if (score < 5000) {
      return Math.max(3, Math.floor(score/500));
    } else {
      alert("That's all for now.");
    } 
  }

  function genGame(score) {
    let number = [];
    for(let i = 0; i < gameLevel(score); i++) {
       number.push(Math.floor(Math.random()*10).toString());
    }
    return number;
  }

  function receiveAnswer(g) {
    guess = g;
    if (correctDigits(g, number) == number.length) {
      state = next
    } else {
      state = again
    }
  }

</script>

<svelte:window on:keypress={pageListener} use:onload on:resize={onresize}/>

<div style:height="{height}px" style:width="{width}px">
  <Answer x={width/2} y={height/2}
          bind:this={queryEl}
          number={number}
          blink={state == blink}
          answer={state == query}
          />

  <div id=instructions>
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
      {correctCount}/{number.length} correct
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
