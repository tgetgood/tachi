<script>
  export const prerender = true;
  export const trailingSlash = 'always';

  import * as Score from '../scoring.js';
  Score.init();
</script>

<slot />
