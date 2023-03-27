<script>
  import * as Score from '../../scoring.js';
  Score.init();

  function l() {
    return Score.scores.currentLevel;
  }
  function s() {
    return Score.scores.levels[l()];
  }
</script>

<div>
  Current level: {l()},
  Current delay: {Math.ceil(s().delay)}ms
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
        <td>{level.name}</td>
        {#each Score.scores.levels[level.name].timeScores as s}
          <td>
            {s.tries === 0 ? "-" : Math.floor(s.correct/s.tries*100) + "%"}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
