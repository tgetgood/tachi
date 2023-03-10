<script>
  export let x = 0;
  export let y = 0;
  export let number = [];
  export let show = false;

  import display from '../utils.js'
</script>

<div id=outer style="top: {x}px; left: {y}px;">
  <h2 class="blink" style={display(show)}>{number}</h2>
</div>

<style>

  #outer {
    position: absolute;
  }

</style>
