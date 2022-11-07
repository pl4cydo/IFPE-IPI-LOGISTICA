<svelte:head>
  <link rel="stylesheet" href="./styles/home.css">
</svelte:head>
<script>
  import MapTest from "./backup/mapTest.svelte";
  var tela = {x:window.screen.width, y:window.screen.height}
  var estado;
  var arrow = 0;

  window.addEventListener("resize", (e) => {
    tela.x = window.screen.width; tela.y = window.screen.height
    console.log("boa noite")
    })

</script>

{#if tela.x < 1024 || tela.y < 720}
<div><p style="text-align:center; font-family:'VT323', monospace; font-size:100px; color:gray">A TELA NAO E COMPATIVEL</p></div>
{:else}
<div id="container">
  <header>
    <nav>
      <div class="nav-container">
        <div id="icones">
          <img id="logo" src="./images/worker.png" alt="trabalhador"/>
          <img id="att" src="./images/checklist.png" alt="Lista de atividades">
        </div>

          <h1><span>LOGISTICA</span></h1>
        
        <ul>
          <li on:click={()=> estado = "Ranking"}>Ranking Global</li>
          <li on:click={()=> estado = "comoJogar"}>Como Jogar</li>
          <li on:click={()=> estado = "Sobre"}>Sobre</li>
        </ul>
      </div>
    </nav>
  </header>
</div>
  
<div id="task">
  <h1>ATIVIDADES A FAZER</h1>
</div>

<main>
    {#if estado === undefined}
    <div id="buttonList">
      <button id="jogar"on:click={()=> estado = "Jogar"}>JOGAR</button>
      <button id="menu"on:click={()=> estado = "Menu"}>MENU</button>
    </div>
    {:else if estado === "Ranking"}
      <div id="rank">
        <h1 id="titulo">RANK (TURMA)</h1>
        <ol id="nome" class="listRank">
          <h1>Nome</h1>
          <li>Fulano</li>
          <li>Fulano</li>
          <li>Fulano</li>
          <li>Fulano</li>
          <li>Fulano</li>
        </ol>

        <ol id="tempo" class="listRank">
          <h1>Tempo</h1>
          <li>3:50</li>
          <li>3:50</li>
          <li>3:50</li>
          <li>3:50</li>
          <li>3:50</li>
        </ol>

        <ol id="turma" class="listRank">
          <h1>Turma(sla)</h1>
          <li>3:50</li>
          <li>3:50</li>
          <li>3:50</li>
          <li>3:50</li>
          <li>3:50</li> 
        </ol>
      </div>

      {:else if estado === "comoJogar"}
      <div id="comoJogar">
      {#if arrow == 0}
      <p id="teste">Controles</p>
      {:else if arrow === 1}
      <p id="teste">Como Acessar missoes</p>
      {:else if arrow === 2}
      <p id="teste">Sistema de Ranking</p>
      {/if}
      {#if arrow < 2}
      <img src="./images/seta.png" alt="avançar" id="dir" on:click={() => arrow++}>
      {/if}
      {#if arrow > 0}
      <img src="./images/seta.png" alt="retroceder" id="esq" on:click={() => arrow--}>
      {/if}
    </div>

    {:else if estado === "Jogar"}
      <MapTest/>
    {/if}
</main>
{/if}
<style>
</style>
