<script>
  let number = Math.floor(Math.random()*1000);
  let hidden = true;
  let height = 800;
  let width = 1000;

  const tac = function (e) {
    console.log(e);
    requestAnimationFrame(() => {
      hidden = false;
      requestAnimationFrame(() => {
        hidden = true
      });
    });
  };

  function press (e) {
    console.log(e);
  };
</script>

<p>Press [Spacebar] to flash next image</p>

<div id=outer style="height: {height}px; width: {width}px;" on:click={tac}>
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

