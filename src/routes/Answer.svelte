<script>
  export let x = 0;
  export let y = 0;
  export let answer = false;
  export let delay = 0;
  export let onClose = () => null;
  export let number = [1,2,3,4];
  export let guess = number.map( x => "");

  $: display = number.reduce((a,x) => a+x, "");

  let digitBoxes = number.map( x => null )

  function focus(state) {
    const box = digitBoxes[state];
    if (box !== null) {
      box.focus();
    }
  }

  function answerEntry(index, e) {
    if (!e.altKey && !e.ctrlKey) {
      e.preventDefault();
    }

    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(e.key) >= 0) {
      guess[index] = e.key;

      if (index < number.length - 1) {
        focus(index + 1)
      } else {
        onClose();
      }
    } else if (e.key == 'Backspace' && index > 0) {
      guess[index - 1] = "";
      focus(index - 1);
    }
  }

  export function clear() {
    guess = number.map(x => "");
    focus(0);
  }

</script>

<div class="quiz-wrapper" style="top: calc({y}px - 2.4em); left: calc({x}px - 5em);" >

  <h2 class="question-container" style:animation-duration={delay}ms>
    {display}
  </h2>

  <div style:display="flex">
  <div style:display={answer ? 'block' : 'none'}
       class="answer-container"
       on:click={clear} >
    {#each guess as digit, index}
      <input bind:this={digitBoxes[index]}
             type=text
             value={digit}
             class="answer-digit"
             on:keydown={e => answerEntry(index, e)}/>
    {/each}
  </div>
  </div>
</div>

<style>
  .question-container {
    visibility: hidden;
    width: 100%;
    text-align: center;
    height: 1em;
    animation-name: blink;
  }

  @keyframes blink {
    from {
      visibility: visible;
    }
    to {
      visibility: hidden;
    }
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

  .answer-container {
    width: 100%;
    display: flex;
    z-index:100;
  }

  .answer-digit {
    height: 1.4em;
    width: 0.6em;
    padding-left: 0.08em;
    border-radius: 0.3em;
    border-width: 0.08em;
    border-color: #dddddd;

    font-size: 1.4em;
  }
</style>
