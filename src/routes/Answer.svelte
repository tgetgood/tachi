<script>
  export let x = 0;
  export let y = 0;
  export let number = [];
  export let show = false;

  import {display} from '../utils.js'

  let guess = [""]
  let state = 0;
  
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


<div id=outer style="top: {x}px; left: {y}px;">

  <div style={display(show)}  id="answer-container">
    {#each guess as digit, index}
      <input id="digit-{index}"
             type=none
             value={digit}
             class="answer-digit"
             on:keydown={answerEntry}
             >
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


    font-size: 1.4em;
  }

  .green {
    border-color: green;
  }
</style>
