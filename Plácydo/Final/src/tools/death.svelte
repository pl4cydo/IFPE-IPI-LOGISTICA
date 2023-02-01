<script>

  class deaths {
    constructor(titulo, texto, img) {
      this.titulo = titulo;
      this.texto = texto;
      this.img = img;
    }
  }

  const caixa = new deaths(
    "Caixa",
    "Você executou um ato inseguro e foi esmagado por uma caixa, infelizmente acidentes acontecem e você estava no lugar errado",
    "./images/deathBox.png"
  );
  const empilhadiera = new deaths(
    "Empilhadeira",
    "Você executou um ato inseguro e foi atropelado por uma empilhadeira, infelizmente acidentes acontecem e você estava no lugar errado",
    "./images/deathAtr.png"
  );
  const choque = new deaths(
    "Choque-eletrico",
    "Você executou um ato inseguro e foi eletrocutado por mexer onde não devia, infelizmente acidentes acontecem e você estava no lugar errado",
    "./images/deathShock.png"
  );
  const queda = new deaths(
    "Plataformaa",
    "Você executou um ato inseguro e caiu da plataforma, infelizmente acidentes acontecem e você estava no lugar errado",
    "./images/deathFall.png"
  );
  let ObjDeath;
  const arrayObjDeath = [caixa, empilhadiera, choque, queda];
  function switchDeath() {
    let num = Math.floor(Math.random() * arrayObjDeath.length);
    ObjDeath = arrayObjDeath[num];
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
    font-family: "VT323";
    color: rgb(0, 0, 0);
    top: 15%;
    /* border: 2px solid black; */
    height: 70%;
    width: 60%;
    background: #dfdede;
    border-radius: 5px;
    box-shadow: black 2px 2px 2px;
    position: absolute;
    display: none;
    justify-content: center;

    /* margin: 0 auto; */
  }
  #coisas {
    /* border: 1px blue solid; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 20px;
  }
  #coisas > p {
    margin-left: 20px;
  }

  #imgs {
    width: 50%;
  }
</style>
