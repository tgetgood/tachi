<script>
  let number;
  let hidden = true;
  let height;
  let width;

  // Difficulty level (number of digits to display)
  let level = 7;

  function setsize(window) {
    height = window.innerHeight
    width = window.innerWidth
  }

  function onload(e) {
    setsize(e);
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
    reset(level);
    flicker(3);
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

<p>Press [Spacebar] to flash next image</p>

<div id=outer style="height: {height}px; width: {width}px;">
  <h2 class={hidden ? "hide" : "show"}>{number}</h2>
</div>



<style>
  .hide {
    display: none;
  }

  div#outer {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
