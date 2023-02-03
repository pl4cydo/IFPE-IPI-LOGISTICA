<script>
  import { taskOrder, walk } from "../stores";
  import { infoTasks2 } from "../stores";
  import { totalPoints } from "../stores";
  import { Nome } from "../stores";
  import { ranking } from "../stores";

  const form = {
    nome: "",
    pontos: 0,
  };

  const addranking = () => {
    form.nome = $Nome;
    form.pontos = $totalPoints;
    $ranking = $ranking.concat({
      nome: form.nome,
      pontos: form.pontos,
    });
  };

  var src; // o mesmo se aplica a varivel acima
  var task; //aqui armazenda o id da tag html provavelmente seja desnecessario
  var score = 0;
  var falar = ""; // e necessario a variavel para a aplicaçao de cada letra para forma o texto e precisa ser global para que o svelte reconheça e aplique na tag
  var roteiro = { txt: 1, nxtTxt: 0, dd: 0 }; // cada um desses são referentes ao texto; txt é para cada letra; nxtTxt é para o prox texto dentro do array; dd deterina um outro array
  var audio = new Audio("./images/info/Siren.mp3"); //audio apenas
  var FinalCheck;
  var ico = [
    { id: "./images/info/oleo.png", dd: 1, chk: "" }, // lista de imagens para a lista de botoes
    { id: "./images/info/pneu.png", dd: 2, chk: "" },
    { id: "./images/info/arrefecimento.png", dd: 3, chk: "" },
    { id: "./images/info/giroflex.png", dd: 4, chk: "" },
    { id: "./images/info/som.png", dd: 5, chk: "" },
    { id: "./images/info/gas.png", dd: 6, chk: "" },
  ];

  for (let i = 0; i < ico.length; i++) {
    ico[i].chk = "/images/info/invisible.png";
  }

  function box() {
    //aqui é onde forma letra por letra na box de dialogos
    roteiro.nxtTxt++;
    roteiro.txt = 1;
    document.getElementById("dialogo").style.display = "flex";
    //dentro de um set interval para colocar letra por letra
    let caixa = setInterval(() => {
      /*texto da caixa de dialogo*/
      let text = [
        [
          /*inicio*/
          "", //tudo isso aqui é todo o texto da task, porem nao esta de forma cronologica vamos assim dizer
          `Olá, ${$Nome}, é muito importante verificar a empilhadeira para a segurança de todos.`,
          "Aqui, iremos passar por pontos importantes da verificação para um melhor entendimento.",
          "A empilhadeira irá para  um local adequado assim é possível observar de perto pontos essenciais.",
          "Vamos lá.",
        ],
        [
          /*motor*/ "",
          "abaixo do assento da empilhadeira existe o motor, bateria, filtro e outros. Porém, vamos focar em revisar regiões que contenham óleo para a lubrificação",
          "em cada um desses indicadores há uma haste mergulhada no oleo ",
          "quando retirados ficarão requícios, depois passamos essa haste em um pano e cor vai indicar sua qualidade",
          "veja a cor escura do óleo, significa que o uso dela ultrapassou e consquentemente a qualidade diminui",
          "aqui é um caso diferente a cor clara do óleo significa que ele esta em bom estado e não será necessario a troca",
          "óleo verificado.",
        ],
        [
          /*pneu*/ "",
          "De suma importância a verificação do pneu, um pneu furado pode causar acidentes graves.",
          "é preciso verificar o estado do pneu, caso exista alguma avaria ele deve ser trocadp.",
          "para evitar essas situações toda semana o pneu da empilhadeira deve ser calibrado",
          "dependendo do modelo da empilhadeira a calibragem pode ser diferente, existem tabelas para isso.",
          "importante se atentar a isso.",
          "o pneu esta descalibrado e na tabela a calibragem correta é 145 psi",
          "...",
          "agora sim esta correto",
          "Pneu verificado.",
        ],
        [
          /*arrefecimento*/ "",
          "o radiador é uma peça que serve para o resfriamento do motor",
          "a tampa do radiador não pode ser aberta logo depois do uso da empilhadeira, se retirado quente pode causar queimaduras",
          "espere ela esfriar para poder retirar a tampa",
          "Após isso, é possível observar se o liquido do radiador esta normal",
          "para descobrir, coloque a ponta do seu dedo, caso fique molhado não é necessario repor. Uma verificação visual também pode ser suficiente.",
          "Radiador verificado.",
        ],
        [
          /*giroflex*/ "",
          "esse sinalizador luminoso é o giroflex",
          "a funçao dele é avisar para pessoas que estejam perto do equipamento sobre seu deslocamento ou movimentação.",
          "caso não funione quando ligado, deve se solicitar a troca",
          "A empilhadeira só se movimenta com o girolex funcionanado, assim se tornando impropia para o uso."
        ],
        [
          /*som de re*/ "",
          "som",
          "função semelhante ao giroflex serve para alerta efetuamento da manobra",
          "e caso não funcione deve se solicitar a troca",
          "A empilhadeira só se movimenta com o som funcionanado, assim se tornando impropia para uso."
        ],
        [
          "",
          "combustivel da empilhadeira",
          "em nossa empresa não temos pit stop para reabaster a empiladeira",
          "para reabastecer a empilhadeira deve repor com outro cilindro ja cheio",
          "para efetuar a troca deve fechar a saida do gas do cilindro depois retirar a mangueira do cilindro",
          "mas cuidado! pode sair o gas que ficou armazenada na mangeueira e o vazamento pode congelar sua mão e o gas ir em direção a seu olho",
          "para evitar deve ligar a empilhadeira depois de fechar a vauvula do cilindro assim fazendo a empilhadeira consumir o gás restante da mangeuira",
          "feito isso remova a mangueira","reitire do suporte que apoia e prende o cilindro","e coloque um cheio","faça o caminho inverso agora",
          "coloque o cilindro","prenda junto ao suporte","coloque a mangueira","abra a vauvula","e sua empilhadeira esta pronta para o uso"
        ],
        [
          "",
          "Bom aqui ao lado esquerdo temos uma lista, e cada um deles irá verificar partes da empilhadeira",
          "depois de todos os itens verificados chegaremos ao fim",
          "use o mouse para clicar nos icones a esquerda e verifique o passo a passo."
        ],
        [
          "",
          "existem empilhadeiras que utilizam combustivel",
          "mas também existem empilhadeiras eletricas que diminuem poluição dentro e fora da empresa",
          "bom... acho que a bateria esta cheia",
        ],
      ];

      if (!(text[roteiro.dd].length == roteiro.nxtTxt)) {
        falar = text[roteiro.dd][roteiro.nxtTxt].substring(0, roteiro.txt);
        roteiro.txt++;
      } else if (text[roteiro.dd].length == roteiro.nxtTxt) {
        if (roteiro.nxtTxt == text[0].length && roteiro.dd != 4 && roteiro.dd != 5) {
          transiçao1();
        }
        roteiro.nxtTxt = 0;
        document.getElementById("dialogo").style.display = "none";
        clearInterval(caixa);
      }
    }, 60);
  }
  //essa função faz a mudança do cenario ativaçao da lista de botoes, animaçao da empilhadeira e umas coisas ai
  function transiçao1() {
    document.getElementById("dialogo").style.display = "none";
    document.getElementById("empilhadeira").style.animationName = "mymove2";
    document.getElementById("Fundo").style.backgroundPosition = 0 + "px";
    setTimeout(() => {
      document.getElementById("Fundo").style.backgroundImage =
        "url('./images/background22.png')";
      document.getElementById("empilhadeira").style.animationName = "mymove";
      document.getElementById("Fundo").style.backgroundSize = "100% 100%";
      document.getElementById("list").style.display = "flex";
      document.getElementById("empilhadeira").style.backgroundImage =
        "url('./images/info/stopEmp.png')";
      roteiro.dd = 7;
      box();
    }, 1950);
  }

  var backgroundX = 0;
  /*aqui é só pra fazer o movimento de fundo da tela, mudando a posição atraves de pixels*/
  const background = setInterval(() => {
    backgroundX += 3;
    document.getElementById("Fundo").style.backgroundPosition =
      backgroundX + "px";
    if (backgroundX > 2400) {
      clearInterval(background);
      box();
    }
  }, 10);

  /*aqui abaixo fica a lista de botões que fica ao lado */
  function lst(num) {
    document.getElementById("list").style.display = "none";
    document.getElementById("list").style.animationName = "bb";
    switch (num) {
      case 1: //exemplo: esse é o motor
        src = "/images/info/motor.gif";
        document.getElementById("boxImg").style.display = "flex";
        score += 30;
        ico[0].chk = "/images/info/check.png";
        break;
      case 2: //rodas
        src = "/images/info/pneumurcho.png";
        document.getElementById("boxImg").style.display = "flex";
        score += 15;
        ico[1].chk = "/images/info/check.png";
        break;
      case 3: //arrefecimento
        src = "./images/info/aqua.png";
        document.getElementById("boxImg").style.display = "flex";
        score += 25;
        ico[2].chk = "/images/info/check.png";
        break;
      case 4:
        score += 10;
        ico[3].chk = "/images/info/check.png";
        break;
      case 5:
        audio.play();
        score += 10;
        ico[4].chk = "/images/info/check.png";
        break;
      case 6:
        src = "./images/info/BarrilEmp.png";
        document.getElementById("boxImg").style.display = "flex";
        score += 10;
        ico[5].chk = "/images/info/check.png";
        break;
      case 7: //aqui é quando aperta na seta ele ira voltar como estava no incio
        document.getElementById("UID").style.display = 'none'
        document.getElementById("empilhadeira").style.backgroundImage =
          "url('./images/info/stopEmp.png')";
        document.getElementById("boxImg").style.display = "none";
        document.getElementById("Fundo").style.backgroundImage =
          "url('./images/background22.png')";
        document.getElementById("list").style.display = "flex";
        document.getElementById("dialogo").style.display = "none";
        FinalCheck = ico.every(checkLst);
        console.log(FinalCheck);
        break;
    }
  }
  function checkLst(icoLst) {
    return icoLst.chk == "/images/info/check.png";
  }
  function backToLobbyEpi() {
    $totalPoints += score;
    $walk = true;
    game.style.display = "flex";
    empilhaBox.style.display = "none";
    $infoTasks2 = "COMPLETO!";
    $taskOrder.t2 = false;
    addranking();
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/styles/empilhadeira.css" />
</svelte:head>

<div id="empilhaBox">
  <div id="Tela">
    <div id="Fundo">
      <div id="opa">
        <div id="list">
          <ul style="list-style: none;">
            {#each ico as { id, dd, chk }}
              <li
                on:click={() => {
                  roteiro.dd = dd;
                  lst(roteiro.dd);
                  box();
                }}
              >
                <img id="checkList" style="height: 65px;" src={chk} alt="" />
                <img src={id} alt="" />
              </li>
              <li />
            {/each}

          </ul>
        </div>

        <div id="empilhadeira" />

      </div>

      <div id="boxImg">
        <ul id="lsbt">
          <img {src} alt="" />
          {#if roteiro.dd == 1 && roteiro.nxtTxt == 3}
            <img
              style="position: absolute;left:0;"
              src="/images/info/frapo.gif"
              alt="frapo"
            />
          {:else if roteiro.dd == 1 && roteiro.nxtTxt == 4}
            <img
              style="position: absolute;left:0;"
              src="/images/info/frapoMelado.png"
              alt="frapo"
            />
          {:else if roteiro.dd == 1 && roteiro.nxtTxt == 5}
            <img
              style="position: absolute;left:0;"
              src="/images/info/frapoMelado.png"
              alt="frapo"
            />
          {:else if roteiro.dd == 2 && roteiro.nxtTxt == 7}
            <img
              style="position: absolute; left:0"
              src="/images/info/calibragem.gif"
              alt="calibrando"
            />
          {:else if (roteiro.dd == 2 && roteiro.nxtTxt >= 8) || (roteiro.dd == 2 && roteiro.nxtTxt == 0)}
            <img
              style="position: absolute; left:0"
              src="/images/info/pneuCheio.png"
              alt="cheio"
            />
          {:else if roteiro.dd == 3 && roteiro.nxtTxt > 1 && roteiro.nxtTxt <= 3}
            <img
              style="position: absolute;;left:0;"
              src="/images/info/queimadura.gif"
              alt="queimou"
            />
          {:else if roteiro.dd == 3 && roteiro.nxtTxt == 4 && roteiro.nxtTxt < 5}
            <img
              style="position: absolute;left:0"
              src="/images/info/tampaarre.png"
              alt=""
            />
          {:else if roteiro.dd == 3 && roteiro.nxtTxt >= 4}
            <img
              style="position:absolute; left:0;"
              src="/images/info/arrefecimentoAnim.gif"
              alt="testando"
            />
          {:else if roteiro.dd == 6 && roteiro.nxtTxt == 4}  
          <img
          style="position:absolute; left:0;"
          src="/images/info/animaçao/fechar.gif"
          alt="testando"
          />
          {:else if roteiro.dd == 6 && roteiro.nxtTxt == 5}  
            <img
          style="position:absolute; left:0;"
          src="/images/info/animaçao/vazamento.gif"
          alt="testando"
          />
          {:else if roteiro.dd == 6 && roteiro.nxtTxt == 7}  
            <img
          style="position:absolute; left:0;"
          src="/images/info/animaçao/removendoCabo.gif"
          alt="testando"
          />
          {:else if roteiro.dd == 6 && roteiro.nxtTxt == 8}  
            <img
          style="position:absolute; left:0;"
          src="/images/info/animaçao/removendoBarril.gif"
          alt="testando"
          />
          {/if}
        </ul>
      </div>
      {#if FinalCheck}
      <div id="fim" style="display: none;">
        <!--coloca aqui os textos-->
      </div>
        <div
          id="UID"
          style="display: flex ; background-image: url('/images/seta.gif'); width:65px;"
          on:click={() => {
            document.getElementById("fim").style.display = 'flex'
            document.getElementById("UID").style.display = 'none'
             // backToLobbyEpi();
          }}
        />
      {:else if roteiro.nxtTxt == 0 && roteiro.dd != 0 && roteiro.dd != 7}
        <div
          id="UID"
          style="display: flex ; background-image: url('/images/seta.gif'); width:65px;"
          on:click={() => {
            lst(7);
          }}
        />
      {/if}

      <div
        id="dialogo"
        on:click={() => {
          box();
        }}
      >
        <p>{falar}</p>
        <div id="seta" />
      </div>

      {#if !(roteiro.txt - 1 > falar.length)}
        <div id="block" />
      {/if}
    </div>
  </div>
</div>
