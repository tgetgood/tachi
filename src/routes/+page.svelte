<script>
  let number;
  let hidden = false;
  let height = 800;
  let width = 1000;

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

  const tac = function (e) {
    reset(7);
    requestAnimationFrame(() => {
      let s = performance.now();
      hidden = false;
      requestAnimationFrame(() => {
        hidden = true;
        let diff = performance.now() - s;
        console.log("time shown (lower bound): " + diff.toString());
      });
    });
  };

</script>

<svelte:window on:keypress={tac}/>
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
