<script>
  import FirstMap from "./mapa1/firstMap.svelte";
  import { estado } from "./Estado";
  import Ranking from "./tools/Ranking.svelte";
  import Menu from "./tools/Menu.svelte";
  

  let a = "Beta2.0";
</script>

<svelte:head>
  <link rel="stylesheet" href="./styles/global.css" />
</svelte:head>

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
    <FirstMap />
  </div>

  <!-- <h1>{a}</h1> -->
  <!-- <Ranking /> -->
  <!-- <Menu /> -->
</main>

<style>

  /* h1{
      position: absolute;
    } */
</style>
