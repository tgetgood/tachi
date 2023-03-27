<script>
  import * as Score from '../../scoring.js';
  Score.init();
</script>

<div>
  Current level: {Score.gameState.level},
  Current delay: {Math.ceil(Score.gameState.delay)}ms
</div>

<br>

<table>
  <thead>
    <tr>
      <th>level</th>
      {#each Score.delayBuckets as b}
        <th>&lt;{b.name}s</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each Score.levels as level}
      <tr>
        <td>{level}</td>
        {#each Score.scoresByDelay(level) as s}
          <td>{s.total === 0 ? "-" : Math.floor(s.correct/s.total*100) + "%"}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

