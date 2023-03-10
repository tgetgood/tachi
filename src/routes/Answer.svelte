<script>
  export let x = 0;
  export let y = 0;
  export let show = false;
  export let onClose = () => null;
  export let number = [1,2,3,4];

  let guess = number.map( x => "");

  function focus(state) {
    const el = document.getElementById("digit-" + state);
    el.focus();
  }

  function answerEntry(index, e) {
    e.preventDefault();
    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(e.key) >= 0) {
      guess[index] = e.key;
      
      if (index < number.length - 1) {
        focus(index + 1)
      } else {
        onClose(guess);
      }
    } else if (e.key == 'Backspace' && index > 0) {
      guess[index - 1] = "";
      focus(index - 1);
    }
  }

  function clear(index) {
    guess = number.map(x => "");
    focus(0);
  }

</script>


<div id=outer style:display={show ? 'block' : 'none'}
     style="top: {x}px; left: {y}px;" >

  <div  id="answer-container" on:click={clear} >
    {#each guess as digit, index}
      <input id="digit-{index}"
             type=none
             value={digit}
             class="answer-digit"
             on:keydown={e => answerEntry(index, e)}/>
    {/each}
  </div>
</div>

<style>
  #outer {
    position: absolute;
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

    /* TODO: remove the text cursor */
    font-size: 1.4em;
  }

  .green {
    border-color: green;
  }
</style>
