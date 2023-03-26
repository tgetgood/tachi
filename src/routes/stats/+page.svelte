<script>
  import * as Score from '../../scoring.js';
  console.log(Score.levels)
</script>

<div>
  Current level: {Score.gameState.level},
  Current delay: {Math.ceil(Score.gameState.delay)}ms
</div>

<table>
  <thead>
    <tr>
      <th>level</th>
      <th>8ms</th>
      <th>128ms</th>
    </tr>
  </thead>
  <tbody>
    {#each Score.levels as level}
      <tr>
        <td>{level}</td>
        <td>{Score.ratio(Score.scoresByDelay(level)[3])}</td>
        <td>{Score.ratio(Score.scoresByDelay(level)[6])}</td>
      </tr>
      {/each}
  </tbody>
</table>
