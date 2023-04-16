<script>
  import * as Score from '../../scoring.js';

  const levelsSchema = Score.levels;

  let currentLevel, delay, levelsState;

  Score.scores.subscribe(x => {
    currentLevel = x.currentLevel;
    levelsState = x.levels;
    delay = levelsState[currentLevel].delay;
  });
</script>

<div>
  Current level: {currentLevel},
  Current delay: {Math.ceil(delay)}ms
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
    {#each levelsSchema as level}
      <tr>
        <td>{level.name}</td>
        {#each levelsState[level.name].timeScores as s}
          {#if Score.delayBuckets.map(x => x.ms).indexOf(s.delay) >= 0}
          <td>
            {s.tries === 0 ? "-" : Math.floor(s.correct/s.tries*100) + "%"}
          </td>
          {/if}
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<footer> <a href="/">back</a> </footer>

<style>
  footer {
    padding-top: 2em;
    padding-left: 1em;
    padding-bottom: 5px;
  }

  footer a {
    text-decoration: none;
    color: #555;
    font-size: x-large;
  }
</style>
