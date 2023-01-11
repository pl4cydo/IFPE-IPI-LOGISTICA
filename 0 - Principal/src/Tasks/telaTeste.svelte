<script>
  import { walk } from "../stores";

  function backToLobby() {
    $walk = true;
    game.style.display = "flex";
    epiContainer.style.display = "none";
  }
</script>

<div id="task0">
  <h1>Task 0</h1>
  <button on:click={() => backToLobby()}>Back</button>
</div>

<style>
  #task0 {
    width: 100vw;
    height: 100vh;
    justify-content: center;
    align-items: center;
    display: none;
  }
</style>
