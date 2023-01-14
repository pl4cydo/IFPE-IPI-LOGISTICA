<script>
  import { trocarEstadoDoJogo } from "../Estado";

</script>

<div id="blocoMenu">
  <div id="Titulo">MENU</div>
  <div id="bot">
    <div id="Inicio" on:click={() => trocarEstadoDoJogo('game')}>Início</div>
    <div id="Sobre">Sobre</div>
    <div id="Ajuda">Ajuda</div>
  </div>
</div>

<style>
  #blocoMenu {
    position: absolute;
    border: 1px solid grey;
    height: 70%;
    width: 70%;
    display: flex;
    top: 20%;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    text-align: center;
  }
  #blocoMenu > div {
    border: 1px solid black;
    color: black;
    position: absolute;
    margin: 2%;
  }
  #Titulo {
    top: 5%;
    width: 40%;
    height: 20%;
  }
  #bot{
    width: 40%;
    height: 60%;
    display:flex;
    justify-content: center;
    align-items: center;
    top: 30%;
  }
  #bot > div {
    position: absolute;
    border: 1px solid black;
    width: 80%;
    height: 20%;
  }
  #Inicio {
    top: 5%;
  }
  #Ajuda {
    bottom: 5%;
  }
</style>
