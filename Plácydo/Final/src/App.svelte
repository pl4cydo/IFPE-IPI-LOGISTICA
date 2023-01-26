<script>
  import { estado } from "./Estado";
  import Ranking from "./tools/Ranking.svelte";
  import Menu from "./tools/Menu.svelte";
  import HowtoPlay from "./tools/HowtoPlay.svelte";

  let a = "Beta2.0";

  let booRanking = false;
  const hiddenRanking = () => {
      if (!booRanking) booRanking = true;
      else booRanking = false;
      if(!booRanking) telaRanking.style.display = "none";
      else telaRanking.style.display = "flex"
  }

  let booHTP = false
  const hiddenHowToPlay = () => {
      if (!booHTP) booHTP = true;
      else booHTP = false;
      if(!booHTP) boxPlay.style.display = "none";
      else boxPlay.style.display = "block"
  }

</script>
<!-- 
<main>
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
        <h1 id="sidebarrTitulo">Dustry</h1>
        <ul>
          <img on:click={() => hiddenRanking() | console.log(booRanking)} class="som" src="./images/ranking.png" alt="Placar" />
          <img on:click={() => hiddenHowToPlay()} class="som" src="./images/comoJogar.png" alt="Como Jogar" />
          <img id="sobre" class="som" src="./images/sobre.png" alt="Sobre" />
        </ul>
      </div>
    </nav>
  </header>
  <div id="tela">
     <FirstMap />
    {#if $estado === "game"}
      <FirstMap />
    {:else if $estado === "menu"}
      <Menu />
    {/if}
      <Ranking />
      <HowtoPlay />
  </div>
</main>
-->
<header>
  <div class="nav-wrapper">
    <nav class="nav-bar">
      <div class="nav-content">
        <div class="logo-wrapper flex-center-align">
          <img class="icons" src="./images/worker.png" alt="trabalhador"/>
          <img class="icons" src="./images/checklist.png" alt="Lista de atividades"/>
        </div>
        <div class="logo-name-wrapper flex-center-align">
          <h1>DUSTRY</h1>
        </div>
        <div class="click-wrapper flex-center-align">
          <img class="icons" on:click={() => hiddenRanking()} src="./images/ranking.png" alt="Placar"/>
          <img class="icons" on:click={() => hiddenHowToPlay()} src="./images/comoJogar.png" alt="Como Jogar"/>
          <img class="icons" src="./images/sobre.png" alt="Sobre"/>
        </div>
      </div>
    </nav>
  </div>
</header>
<main>
 <Menu></Menu>
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  *{
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
  .nav-wrapper{
    background: black;
    width: 100vw;
    height: 10vh;
  }

  .nav-bar{
    width: 100%;
    height: 100%;
  }

  .nav-content{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;

  }

  .icons{
    width: 15%;
    margin-left: 2vw;
  }

  .flex-center-align{
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo-wrapper,.click-wrapper{
    width: 30%;
    height: 100%;
  }

  .click-wrapper{
    cursor: pointer;
  }
  .logo-name-wrapper{
    width: 40%;
    height: 100%;
    text-align: center;
    font-size: 3em;
    font-family: 'VT323';
    letter-spacing: 10px;
    color: #f2f2f2;
    text-shadow: rgb(48, 144, 255) 1px 0px 1px;
  }
  main{
    width: 100vw;
    height: 90vh;
  }
  .logo-wrapper > img{
    width: 10% ;

  }



</style>
