<script>
  import FirstMap from "./mapa1/firstMap.svelte";
  import { estado } from "./Estado";
  import Ranking from "./tools/Ranking.svelte";
  import Menu from "./tools/Menu.svelte";

  let a = "Beta2.0";
</script>

<main>
  <div id="tela">
    <header>
      <nav>
        <div class="nav-container">
          <div id="icones">
            <img id="logo" src="./images/worker.png" alt="trabalhador" />
            <img
              id="att"
              src="./images/checklist.png"
              alt="Lista de atividades"
            />
          </div>
          <h1><span>LOGISTICA</span></h1>
          <ul>
            <img class="som" src="./images/ranking.png" alt="Placar" />
            <img class="som" src="./images/comoJogar.png" alt="Como Jogar" />
            <img class="som" src="./images/sobre.png" alt="Sobre" />
          </ul>
        </div>
      </nav>
    </header>
    {#if $estado === "game"}
      <FirstMap />
    {:else if $estado === "menu"}
      <Menu />
    {/if}
  </div>

  <!-- <h1>{a}</h1> -->
  <!-- <Ranking /> -->
</main>

<style>
  main {
    height: 100vh;
    width: 100vw;
    justify-content: center;
    align-items: center;
    display: flex;
  }
  #tela {
    width: 1080px;
    height: 720px;
    justify-content: center;
    align-items: center;
    display: flex;
    border: 1px solid black;
    position: absolute;
    overflow: hidden;
  }
  header {
    position: relative;
    display: block;
    top: -44%;
    height: 92px;
    width: 100%;
    user-select: none;
    background-color: rgba(17, 16, 16, 0.926);
  }
  .nav-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 92px;
  }
  #icones {
    gap: 25px;
    width: 25%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  #logo {
    width: 50px;
    height: 50px;
  }
  .som {
    width: 90px;
    height: 85px;
    cursor: pointer;
  }
  #att {
    width: 50px;
    height: 50px;
    display: block;
  }
  
</style>
