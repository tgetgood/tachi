<script>
  let number = "";
  let hidden = true;
  let height;
  let width;

  // HACK: is this really the way to do it?
  let document;

  // Difficulty level (number of digits to display)
  let level = 4;

  let guess = "";

  $: tg = guess.trim();

  $: correctD = correctDigits(tg, number);
  $: correctP = correctD == level;


  function correctDigits(a, b) {
    console.log(a, b)
    let out = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      console.log(i, a[i], b[i])
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

  function flicker (n) {
    hidden = false;
    if (n > 0) {
      requestAnimationFrame(() => flicker(n - 1));
    } else {
      hidden = true;
    }
  }

  function tac (e) {

    if (e.key === ' ') {
      console.log(correctDigits(guess.trim(), number))

      // Try again until correct
      if (number == "" || correctP) {
        reset(level);
      };

      guess = '';
      flicker(4);
      document.getElementById("guess").focus();
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
  };
</script>

<svelte:window on:keypress={tac} use:onload on:resize={onresize}/>


<div id=outer style="top: {height/2}px; left: {width/2}px;">
  <h2 id="inner">{hidden ? "" : number}</h2>

  <input id="guess" type=none size=5 bind:value={guess} class={correctP ? "green" : ""}>

  <p>Press [Spacebar] to flash next image</p>
</div>



<style>
  .hide {
    display: none;
  }

  div#outer {
    position: absolute;
  }

  #inner{
    height: 2em;
  }

  #guess {
    border-radius: 0.7em;
    border-width: 4px;
    padding: 0.2em;
    border: solid;
  }

  .green {
    border-color: green;
  }
</style>
