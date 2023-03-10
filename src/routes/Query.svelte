<script>
  export let x = 0;
  export let y = 0;
  export let number = [];
  export let show = false;
</script>

<div style:display={ show ? 'block' : 'none'}
     style="position: absolute; top: {x}px; left: {y}px;">
  <h2 class="blink">{number}</h2>
</div>

