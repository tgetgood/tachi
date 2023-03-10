<script>

  import Answer from './Answer.svelte';

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

  
</script>

<svelte:window on:keypress={tac} use:onload on:resize={onresize}/>

<Answer x={width/2} y={height/2} number={['1', '2', '3', '4']} show={true}/>

<p style={show(state, next)}>Press [Spacebar] to flash next image</p>


