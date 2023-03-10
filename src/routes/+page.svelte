<script>
  const init = Symbol("init");
  const blink = Symbol("blink");
  const input = Symbol("input");
  const next = Symbol("next");
  const again = Symbol("again");

  let state = [init, 0];

  let number = "";
  let hidden = true;
  let height;
  let width;

  // HACK: is this really the way to do it?
  let document;

  // Difficulty level (number of digits to display)
  let level = 4;

  let guess = [];

  $: correctD = correctDigits(guess, number);
  $: correctP = correctD == level;


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
    height = window.innerHeight*.95;
    width = window.innerWidth*0.95;
  }

  function onload(e) {
    setsize(e);
    document = e.document;
  }

  function onresize(e) {
    setsize(this);
  }


  function resetGame() {

  }

  function adjustLevel(result) {
  }

  function flicker (n) {
    state = [init, 0];
    setTimeout(Math.random()*1000+500, (() => {
      state = [blink, 0];
      if (n > 0) {
        requestAnimationFrame(() => flicker(n - 1));
      } else {
        state = [input, 0];
        focus(state);
      }
    })());
  }

  function tac (e) {

    if (e.key === ' ') {

      // Try again until correct
      // if (number == "" || correctP) {
        reset(level);
      // };

      guess = ["", "", "", ""];
      flicker(4);

    }
  }

  function reset(digits) {
    let mask = Math.pow(10, digits);
    let n = Math.floor(Math.random() * mask);
    let len = Math.ceil(Math.log10(n));
    if (len < digits) {
      number = "0"
        for (let i = digits - len - 1; i > 0; i--) {
        number += "0";
      };
      number += n.toString();
    } else {
      number = n.toString();
    }
  }

  function show(state, s) {
    if (state[0] == s) {
      return 'display: block;';
    } else {
      return 'display: none;';
    }
  }

  function focus(state) {
    if (state[0] == input) {
      const el = document.getElementById("digit-"+state[1]);
      setTimeout(10, el.focus());
    }
  }

  function answerEntry(e) {
    e.stopPropagation();
    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(e.key) >= 0) {
      e.preventDefault();
      guess[state[1]] = e.key;
      if (state[1] < level - 1) {
        state = [state[0], state[1] + 1]
        focus(state)
      } else {
        state = evaluateAnswer(guess);
      } 
    } else if (e.key == 'Backspace' && state[1] > 0) {
      state = [state[0], state[1] - 1];
      focus(state);
    } else {
      e.preventDefault();
    }
  }
  
</script>

<svelte:window on:keypress={tac} use:onload on:resize={onresize}/>

<div id=outer style="top: {height/2}px; left: {width/2}px;">
  <h2 class="blink" style={show(state, blink)}>{number}</h2>

  <div style={show(state, input)} id="answer-container">
    {#each guess as digit, index}
      <input id="digit-{index}"
             type=none
             value={digit}
             class={(correctP ? "green" : "") + "answer-digit"}
             on:keydown={answerEntry}
             >
    {/each}
  </div>

  <p style={show(state, next)}>Press [Spacebar] to flash next image</p>
</div>



<style>
  #outer {
    position: absolute;
  }

  #inner{
    height: 2em;
  }

  #answer-container {
    display: flex;
  }

  .answer-digit {
    height: 1.4em;
    width: 0.6em;
    margin-left: 0.1em;
    padding-left: 0.1em;
    border-radius: 0.3em;
    border-width: 0.1em;
    border-color: lightgrey;


    font-size: 1.4em;
  }

  .green {
    border-color: green;
  }
</style>
