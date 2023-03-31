<script>
  export let x = 0;
  export let y = 0;
  export let answer = false;
  export let onClose = () => null;
  export let number = [1,2,3,4];
  export let guess = number.map( x => "");
  export let showFocusDot = true;

  let blinkEl;
  let focusDot;

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

  export function flash(preDelay, flashTime) {
    const anim = {opacity: [1]};
    // These timeouts are pretty hacky.
    if (showFocusDot) {
      setTimeout(() => focusDot.animate(anim, Math.min(50, flashTime)), 600);
    }

    setTimeout(() => blinkEl.animate(anim, flashTime), preDelay);
  }

</script>

<div class="quiz-wrapper" style="top: calc({y}px - 2.4em); left: calc({x}px - 5em);" >

  <div bind:this={focusDot} class="focus-dot"><b>·</b></div>
  <h2 bind:this={blinkEl} class="question-container">
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
  .focus-dot {
    font-size: 2em;
    height: 0;
    opacity: 0;
    position: relative;
    top: -0.4em;
  }

  .question-container {
    opacity: 0;
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
