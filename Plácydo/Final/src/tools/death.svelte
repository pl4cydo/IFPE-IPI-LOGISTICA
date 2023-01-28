<script>
  import { onMount } from "svelte";

  class deaths {
    constructor(titulo, texto, img) {
      this.titulo = titulo;
      this.texto = texto;
      this.img = img;
    }
  }

  const caixa = new deaths(
    "Caixa",
    "Você morreu esmagado por uma caixa, infelizmente acidentes acontecem e você estava no lugar errado",
    "./images/deathBox.png"
  );
  const empilhadiera = new deaths(
    "Epilhadeira",
    "Você foi atropelado por uma empilhadeira, infelizmente acidentes acontecem e você estava no lugar errado",
    "./images/deathAtr.png"
  );
  const choque = new deaths(
    "Choque-eletrico",
    "Você foi eletrocutado por mexer onde não devia, infelizmente acidentes acontecem e você estava no lugar errado",
    "./images/deathShock.png"
  );
  const queda = new deaths(
    "Lugar alto",
    "Você caiu da plataforma, infelizmente acidentes acontecem e você estava no lugar errado",
    "./images/deathFall.png"
  );
  let ObjDeath;
  const arrayObjDeath = [caixa, empilhadiera, choque, queda];
  function switchDeath() {
    let num = Math.floor(Math.random() * arrayObjDeath.length);
    ObjDeath = arrayObjDeath[0];
  }
  switchDeath();
</script>

<div id="deathBox">
  <div id="coisas">
    <h1>{ObjDeath.titulo}</h1>
    <p>{ObjDeath.texto}</p>
    <img id="imgs" src={ObjDeath.img} alt="caixa" />
  </div>
</div>

<style>
  #deathBox {
    color: white;
    top: 15%;
    border: 1px solid black;
    height: 70%;
    width: 60%;
    background-color: rgb(9, 9, 61);
    position: absolute;
    display: flex;
    justify-content: center;

    /* margin: 0 auto; */
  }
  #coisas {
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  #imgs {
    width: 50%;
  }
</style>
