<svelte:head>
  <link rel="stylesheet" href="./styles/home.css">
</svelte:head>
<script>
  import MapTest from "./backup/mapTest.svelte";
  var tela = {x:window.screen.width, y:window.screen.height}
  var estado;
  var arrow = 0;
  var teste = false;
  window.addEventListener("resize", (e) => {
    tela.x = window.screen.width; tela.y = window.screen.height
    console.log("boa noite")
    })

  function flaxi(){
    teste = !teste
    if(teste){
      document.body.style.setProperty('--black', '#666');
      document.body.style.setProperty('--white', 'rgba(17, 16, 16, 0.926)');
      console.log("piiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    }else{
      document.body.style.setProperty('--white', '#fff');
      document.body.style.setProperty('--black', 'black');
    }
  }
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
          <img class="som" src="./images/ranking.png" alt="Placar" on:click={()=> estado = "Ranking"}/>
          <img class="som" src="./images/comoJogar.png" alt="Como Jogar" on:click={()=> estado = "comoJogar"}/>
          <img class="som" src="./images/sobre.png" alt="Sobre" on:click={()=> estado = "Sobre"}/>
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
      <button id="jogarButton"on:click={()=> estado = "Jogar"}>JOGAR</button>
      <button id="menuButton"on:click={()=> estado = "Menu"}>MENU</button>
    </div>
    {:else if estado === "Menu"}
    <div class="ListInfo">
      <div>
        <img src="./images/dark.png" alt="dark" id="dark" class="som" on:click={flaxi}/>
        <img src="./images/closeButton.png" alt="fechar" class="CloseButton" on:click={() => estado = undefined}>
        <img class="som" src="./images/somAtivado.png" alt="som ativado">
        <img class="som"src="./images/SomDesativado.png" alt="som desativado">
      </div>
    </div>
    {:else if estado === "Ranking"}
      <div class="ListInfo">
        <img src="./images/closeButton.png" alt="fechar" class="CloseButton" on:click={() => estado = undefined}>
        <h1 id="titulo">RANK (TURMA)</h1>
        <div id="listContainer">
          <ol class="listRank">
            <h1>NOME</h1>
            <li>Fulano</li>
            <li>Fulano</li>
            <li>Fulano</li>
            <li>Fulano</li>
            <li>Fulano</li>
          </ol>
  
          <ol class="listRank">
            <h1>TEMPO</h1>
            <li>3:50</li>
            <li>3:50</li>
            <li>3:50</li>
            <li>3:50</li>
            <li>3:50</li>
          </ol>
  
          <ol class="listRank">
            <h1>TURMA(sla)</h1>
            <li>3:50</li>
            <li>3:50</li>
            <li>3:50</li>
            <li>3:50</li>
            <li>3:50</li> 
          </ol>
        </div>  
  </div>
      {:else if estado === "comoJogar"}
      <div class="ListInfo">
        <img src="./images/closeButton.png" alt="fechar" class="CloseButton" on:click={() => estado = undefined}>
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
      {:else if estado === "Sobre"}
      <div class="ListInfo">
        <img src="./images/closeButton.png" alt="fechar" class="CloseButton" on:click={() => estado = undefined}>
      </div>
    {/if}
</main>
{/if}
<style>
</style>
