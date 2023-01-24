<script>
  import { trocarEstadoDoJogo } from "../Estado";
  import  FirstMap  from "../mapa1/FirstMap.svelte";
  import { onMount } from "svelte";
  import { estado } from "../Estado";
  import { Nome } from "../stores";

  const hiddenName = () => {
    inputName.style.display = "none";
  };

  //variavel declarada como array para receber o json tratado
  let leitor = [];

  async function loadRanking() {
    let resposta = await fetch("http://localhost:8001/ler_banco.php");
    let texto = await resposta.text();
    let json = JSON.parse(texto);
    leitor = json;
  }
  onMount(async () => {
    await loadRanking();
  });
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
    </div>
    <div class="area-jogo flex-align-center">
      {#if $estado === "menu"}
        <div class="btn-wrapper flex-align-center">
          <div class="menu-btn" on:click={() => trocarEstadoDoJogo("game")}>
            INÍCIO
          </div>
          <div class="menu-btn">SOBRE</div>
          <div class="menu-btn" on:click={console.log($Nome)}>AJUDA</div>
        </div>
      {:else if $estado === "game"}
        <FirstMap />  
        {/if}
      </div>
      {#if $estado === "game"}
        
      <div class="rankingarea flex-align-center">
        <div class="tabela-de-ranking">
          <div class="ranking-tittle">
            <h1>RANKING</h1>
          </div>
          <div class="players">
            {#each leitor as el, i}
            <div class="player" class:first={i == 0} class:second={i == 1} class:third={i == 2}>
              {#if i < 15}
              <div class="p-position flex-align-center"><h2>{i + 1 + "º"}</h2></div> 
              <div class="p-name flex-align-center">{el.Nome}</div>
              <div class="p-points flex-align-center">{el.pontos}</div>
              {/if}
            </div>
            {/each}
          </div>
        </div>
      </div>
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
    background: peru;
    width: 20%;
    height: 100%;
  }
  .area-jogo {
    position: relative;
    /* background: purple; */
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
  .rankingarea {
    
    width: 20%;
    height: 100%;
    font-family: 'VT323';
  }
  .tabela-de-ranking{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .ranking-tittle{
    text-align: center;
    color: black;
    text-shadow: black 1px 0 1px;
    font-size: 2em;
    letter-spacing: 2px;
  }
  .players{
    padding: 5%;
    display: flex;
    flex-flow: column nowrap;
  }
  .player{
    background: #dfdede;
    padding: 5px;
    border-bottom: 1px solid #888888;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 3%;
    box-shadow: black 2px 2px 2px;
  }
  .p-name,.p-points,.p-position{
    width: 30%;
    color: black;
    font-weight: 700;
  }
  .p-name{
    font-size: 1.2em;
  }
  .first{
    background: gold;
  }
  .second{
    background: silver;
  }
  .third{
    background: coral;
  }
  @media (max-width: 1278px){
    .rankingarea{
      display: none;
    }

  }

</style>
