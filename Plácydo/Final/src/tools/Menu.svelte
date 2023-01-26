<script>
  import { trocarEstadoDoJogo } from "../Estado";
  import  FirstMap  from "../mapa1/FirstMap.svelte";
  import { estado } from "../Estado";
  import { Nome } from "../stores";
  import Sideranking from "./Sideranking.svelte";
  import Inputname from "./Inputname.svelte";
  import HowtoPlay from "./HowtoPlay.svelte";

  const hiddenName = () => {
    inputName.style.display = "none";
  };

</script>

<!-- <div id="blocoMenu">
  <div id="Titulo">MENU</div>
  <div id="bot">
    <div id="Inicio" on:click={() => trocarEstadoDoJogo('game')}>Início</div>
    <div id="Sobre">Sobre</div>
    <div id="Ajuda" on:click={console.log($Nome)}>Ajuda</div>
  </div>
  <div id="addNome">
      <input 
          type="text" 
          placeholder="Nome" 
          name="Nome"
          bind:value={$Nome}
        />
      <button on:click={hiddenName}>Ok</button>
  </div>
</div> -->
<div class="menu-wrapper">
  <section>
    <div class="info1 flex-align-center ">
      <!-- <div id="inputName">
        <input type="text" placeholder="Nome" name="Nome" bind:value={$Nome} />
        <button on:click={hiddenName}>Ok</button>
      </div> -->
      {#if $estado === "game"}
        <HowtoPlay />  
      {/if}
    </div>
    <div class="area-jogo flex-align-center">
      {#if $estado === "menu"}
        <div class="btn-wrapper flex-align-center">
          <div class="menu-btn" on:click={() => trocarEstadoDoJogo("nome")}>
            JOGAR
          </div>
          <div class="menu-btn">SOBRE</div>
          <div class="menu-btn" on:click={console.log($Nome)}>AJUDA</div>
        </div>
      {:else if $estado === "nome"}
        <Inputname />
      {:else if $estado === "game"}
        <FirstMap />  
        {/if}
      </div>
      {#if $estado === "game"}
        <Sideranking />  
      {/if}

    </section>
  </div>
  
  <style>
  
    
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .menu-wrapper {
    width: 100%;
    height: 100%;
  }
  .flex-align-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  section {
    display: flex;
    width: 100%;
    height: 100%;
  }
  .info1 {
    width: 20%;
    height: 100%;
  }
  .area-jogo {
    position: relative;
    width: 60%;
    height: 100%;
  }
  .btn-wrapper {
    background: white;
    width: 50%;
    flex-flow: column nowrap;
    cursor: pointer;
    gap: 5px;
  }
  .menu-btn {
    color: black;
    font-size: 3em;
  }
</style>
