<script>
  import MapTest from "./backup/mapTest.svelte";
  import Map from "./contents/map.svelte";
  var estado;
  var arrow = 0;
  console.log(estado)
</script>
<div class="container">
  <header>
    <nav>
      <div class="nav-container">
        <h1 id="title">LOGÍSTICA</h1>
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
    <button id="jogar"on:click={()=> estado = "Jogar"}>JOGAR</button>
    <button id="menu"on:click={()=> estado = "Menu"}>MENU</button>
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
</div>

<style>

@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100&family=VT323&display=swap');

  .container {
    max-width: 1920px;
    width: 100%;
    overflow: hidden;
  }

  #title{
    position: relative;
    color: #666;
    left: 44%;
    line-height: 100px;
    margin: 0 0;
    font-size: 60px;
    width: 0px;
    height: 0px;
    font-family:'VT323', monospace;
  }

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
    max-width: 1900px;
    width: 100%;
    position: relative;
    margin-right: auto;
    margin-left: auto;
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

  main {
    padding: 0;
    margin: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    position: absolute;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  #rank {
    position: absolute;
    width: 100%;
    height: 100%;
    max-width: 1024px;
    max-height: 720px;
    background-color: gray;
    display: flex;
    overflow: hidden;
  }

  #titulo {
    position: absolute;
    left: 30%;
    font-size: 80px;
    color: #fff;
    font-family: 'VT323', monospace;
    white-space: nowrap;
  }

  #menu{
    font-size: 80px;
    color: #000;
    border: none;
    border-radius: 5px;
    background-color: rgb(43, 43, 167);
    font-size: 180px;
    font-family: 'VT323', monospace;
    position: absolute;
    top: 60%;
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
    overflow-x: visible;
  }

  #jogar{
    color: #000;
    border: none;
    border-radius: 5px;
    background-color: green;
    font-size: 180px;
    font-family: 'VT323', monospace;
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
