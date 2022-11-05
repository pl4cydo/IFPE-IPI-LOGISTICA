<script>
  import MapTest from "./backup/mapTest.svelte";
  var tela = {x:window.screen.width, y:window.screen.height}
  var estado;
  var arrow = 0;
</script>
{#if tela.x < 1020 || tela.y < 800}
<div><p style="text-align:center; font-family:'VT323', monospace; font-size:100px; color:gray">A TELA NAO E COMPATIVEL</p></div>
{:else}
  <header>
    <nav>
      <div class="nav-container">
        <img id="logo" src="./images/worker.png" alt="trabaiador" />
        <ul>
          <li on:click={()=> estado = "Ranking"}>Ranking Global</li>
          <li on:click={()=> estado = "comoJogar"}>Como Jogar</li>
          <li on:click={()=> estado = "Sobre"}>Sobre</li>
        </ul>
      </div>
    </nav>
  </header>

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

@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100&family=VT323&display=swap');

  header {
    position: absolute;
    top: 0;
    height: auto;
    width: 100%;
  }

  nav {
    position: fixed;
    top: 0;
    height: 92px;
    width: 100%;
    z-index: 1;
    background-color: rgba(17, 16, 16, 0.926);
    user-select: none;
  }

  nav::after {
    clear: both;
    content: "";
    display: block;
  }

  .nav-container {
    max-width: 1800px;
    width: 100%;
    height: 100%;
  }

  #logo {
    width: 50px;
    height: 50px;
    margin-top: 20px;
    margin-left: 120px;
  }

  .nav-container ul {
    float: right;
    line-height: 100px;
    margin: 0;
  }

  .nav-container li {
    list-style: none;
    float: left;
    margin: 0 30px;
    cursor: pointer;
    color: #666;
    font-size: 25px;
    font-family: 'VT323', monospace;
  }

  #task{
    top: 90px;
    max-width: 300px;
    width: 100%;
    background-color: rgb(71, 64, 64);
    position: absolute;
    float: left;
  }

  #task h1{
    position: relative;
    text-align: center;
    font-size: 30px;
    color: #fff;
    font-family: 'VT323', monospace;
  }
  #buttonList{
    width: 375px;
    height:auto;
  }
  main {
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  }

  #rank {
    position: absolute;
    width: 100%;
    height: 100%;
    max-width: 1024px;
    max-height: 720px;
    background-color: gray;
    display: flex;
  }

  #titulo {
    position: absolute;
    left: 30%;
    font-size: 80px;
    color: #fff;
    font-family: 'VT323', monospace;
    white-space: nowrap;
  }
  
  
  .listRank{
    position: relative;
    text-align: center;
    list-style: none;
    font-size: 20px;
    font-family: 'VT323', monospace;
    color: #fff;
  }
  
  #nome {
    top: 20%;
    left: 10%;
  }

  #tempo {
    top: 20%;
    left: 30%;
  }
  
  #turma {
    top: 20%;
    left: 45%;
  }
  
  #rank ol li {
    font-size: 30px;
  }
  
  #comoJogar{
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 1024px;
    max-height: 720px;
    display: flex; 
    border-style: solid;
  }

  #teste {
    position: relative;
    top: 45%;
    left: 45%;
    max-height: 0;
    margin: 0;
  }

  #jogar{
    color: #000;
    border: none;
    border-radius: 5px;
    background-color: green;
    font-size: 180px;
    font-family: 'VT323', monospace;
  }
  
  #menu{ 
    position: relative; 
    color: #000;
    border: none;
    border-radius: 5px;
    background-color: rgb(43, 43, 167);
    font-size: 180px;
    font-family: 'VT323', monospace;
    left: 35px;
  }

  #esq{
    position: absolute;
    top: 90%;
    left: 10%;
    transform: rotateY(180deg);
  }

  #dir{
    position: absolute;
    top: 90%;
    left: 80%;
  }
</style>
