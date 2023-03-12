<script>
  export let x = 0;
  export let y = 0;
  export let answer = false;
  export let blink = false;
  export let onClose = () => null;
  export let number = [1,2,3,4];

  $: guess = number.map( x => "");

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

  export function clear(index) {
    guess = number.map(x => "");
    focus(0);
  }

</script>

<div class="quiz-wrapper" style="top: {x}px; left: {y}px;" >

  <h2 class="blink">{blink ? number.reduce((a,x) => a+x, "") : ""}</h2>

  <div style:display="flex">
  <div style:display={answer ? 'block' : 'none'}
       id="answer-container"
       on:focus={clear} >
    {#each guess as digit, index}
      <input id="digit-{index}"
             type=text
             value={digit}
             class="answer-digit"
             on:keydown={e => answerEntry(index, e)}/>
    {/each}
  </div>
  </div>
</div>

<style>
  .blink {
    width: 100%;
    text-align: center;
    height: 1em;
  }

  .quiz-wrapper {
    display: flex;
    position: absolute;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 10em;
  }
  
  input {
    color: transparent;
    text-shadow: 0 0 0 #000000;
  }

  #answer-container {
    width: 100%;
    display: flex;
  }

  .answer-digit {
    height: 1.4em;
    width: 0.5em;
    padding-left: 0.05em;
    border-radius: 0.3em;
    border-width: 0.08em;
    border-color: #dddddd;

    /* TODO: remove the text cursor */
    font-size: 1.4em;
  }

  .green {
    border-color: green;
  }
</style>
