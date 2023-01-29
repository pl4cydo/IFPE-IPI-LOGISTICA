<script>
    var src; // o mesmo se aplica a varivel acima
    var task; //aqui armazenda o id da tag html provavelmente seja desnecessario
    var score = 0
    var falar = "";// e necessario a variavel para a aplicaçao de cada letra para forma o texto e precisa ser global para que o svelte reconheça e aplique na tag
    var roteiro = { txt: 1, nxtTxt: 0,dd:0}; // cada um desses são referentes ao texto; txt é para cada letra; nxtTxt é para o prox texto dentro do array; dd deterina um outro array
    var audio = new Audio('./images/info/Siren.mp3');//audio apenas
    var ico = [{id: './images/info/oleo.png', dd:1, chk:'' }, // lista de imagens para a lista de botoes
              { id: './images/info/pneu.png', dd:2, chk:''},
              { id: './images/info/arrefecimento.png', dd:3, chk:''},
              { id: './images/info/giroflex.png', dd:4, chk:''},
              { id: './images/info/som.png', dd:5, chk:''}];

    for(let i = 0; i < ico.length;i++ ){
            ico[i].chk = '/images/info/invisible.png'
    }
    
    function box() {//aqui é onde forma letra por letra na box de dialogos
        roteiro.nxtTxt++;
        roteiro.txt = 1;
        document.getElementById("dialogo").style.display = 'flex'
        //dentro de um set interval para colocar letra por letra
        let caixa = setInterval(() => {
                /*texto da caixa de dialogo*/
                 let text = [[/*inicio*/
                "",//tudo isso aqui é todo o texto da task, porem nao esta de forma cronologica vamos assim dizer
                "Opa! vejo que equipou o EPI já é um passo a mais da nossa check-list ","não só isso a check-list envolve revisar a empilhadeira e se tiver tudo certo esta liberada para operar",
                "Vou levar a empilhadeira a um local adequado para podermos observar de perto pontos essenciais",
                "Vamos lá."],
                [/*motor*/"","abaixo do assento da empilhadeira existe o motor, bateria, filtro e outros. Mas vamos ficar em revisar regiões que contenham oleo para a lubrificação",
                "em cada um desses indcadores há uma haste mergulhada no oleo ",
                "quando retirados ficam requícios e é ai que passamos essa haste em um frapo e cor vai indicar sua qualidade",
                "veja a cor escura do oleo, significa que o uso dela ultrapassou e consquentemente a qualidade diminui",
                "aqui é um caso diferente a cor clara do oleo significa que ele esta em bom estado e não será necessario a troca",
                "bem simples não? aqui terminamos vamos ao proximo!"],
                [/*pneu*/"","sem muito segredo no pneu né?","uma rapida olhada averiguando se esta murcho ou com avaria","mas para evitar essas situações toda semana o pneu da empilhadeira deve ser calibrado",
                "dependendo do modelo da empilhadeira tem sua tabela de calibragem","deve se atentar a isso","o pneu esta descalibrado e na tabela desse pneu é 145 psi","...","agora sim esta correto","vamos para o proximo"],
                [/*arrefecimento*/"","o radiador é uma peça que serve de resfriamento do motor","a tampa do radiador não pode ser aberta logo depois do uso da empilhadeira se retirado quente pode causar queimaduras",
                "espere ela esfriar para ai sim poder retirar a tampa","ai sim podemos observar se o liquido do radiador esta normal",
                "para descobrir com seu dedo molhe a ponta do seu dedo dele caso fique molhado não é necessario repor mas só de olhar se percebe o nivel","bem tranquilo vamos ao proximo "],
                 [/*giroflex*/"","essa luz luminosa é o giroflex","a funçao dele é avisar, para pessoas que estejam perto do equipamento, sobre seu deslocamento ou movimentação.",
                 "caso não funione quando ligado, deve se solicitar a troca"],
                [/*som de re*/"","som","função semelhante ao giroflex serve para alerta efetuamento da manobra","e caso não funcione deve se solicitar a troca"],
                ["a bateria esta prestes a acabar","clique no painel para poder carregar"],
                ["","Bom aqui ao lado esquerdo temos uma lista, e cada um deles irá verificar partes da emplhadeira",
                " e em uma delas mostrarei como trocar caso seja necessario","depois de todos os itens verificados finalize clicando no botão verde"],
                ["","existem empilhadeiras que utilizam combustivel","mas também existem empilhadeiras eletricas que diminuem poluição dentro e fora da empresa","bom... acho que a bateria esta cheia"]];
               
                if (!(text[roteiro.dd].length == roteiro.nxtTxt)) {
                    falar = text[roteiro.dd][roteiro.nxtTxt].substring(0, roteiro.txt);
                    roteiro.txt++;
                    console.log(roteiro.dd,roteiro.nxtTxt)
                }else if(text[roteiro.dd].length == roteiro.nxtTxt){
                    if (roteiro.nxtTxt == text[0].length ){
                        transiçao1()   
                    }
                    roteiro.nxtTxt = 0
                    document.getElementById("dialogo").style.display = 'none'
                    clearInterval(caixa)
                }
            }, 60);
            
        }
        //essa função faz a mudança do cenario ativaçao da lista de botoes, animaçao da empilhadeira e umas coisas ai
        function transiçao1() {
        document.getElementById("dialogo").style.display = "none";
        document.getElementById("empilhadeira").style.animationName = 'mymove2';
        document.getElementById("Fundo").style.backgroundPosition = 0 + "px";
        setTimeout(()=>{
            document.getElementById("Fundo").style.backgroundImage = "url('./images/background22.png')"; 
            document.getElementById("empilhadeira").style.animationName = 'mymove';
            document.getElementById("Fundo").style.backgroundSize = '100% 100%'; 
            document.getElementById("list").style.display = 'flex'
            document.getElementById("empilhadeira").style.backgroundImage = "url('./images/info/stopEmp.png')"
            roteiro.dd = 7;box();
        },1950);

    }

    var backgroundX = 0;
    /*aqui é só pra fazer o movimento de fundo da tela, mudando a posição atraves de pixels*/
    const background = setInterval(() => {
        document.getElementById("UID").style.display = 'none'
        backgroundX += 3;
        document.getElementById("Fundo").style.backgroundPosition = backgroundX + "px";
        if (backgroundX > 2400) {
            clearInterval(background); 
            box();
        }
    }, 10);

/*aqui abaixo fica a lista de botões que fica ao lado */
    function lst(num){
        document.getElementById("list").style.display = 'none'
        document.getElementById("list").style.animationName = "bb"
        switch (num) {
        case 1://exemplo: esse é o motor 
            src = "/images/info/motor.gif"
            task = document.getElementById("imgs")
            task.style.display = 'flex'
            document.getElementById("UID").style.display = 'flex'
            score += 30
            ico[0].chk = '/images/info/check.png'
        break;
        case 2://rodas
            src = "/images/info/pneumurcho.png"
            task = document.getElementById("imgs")
            task.style.display = 'flex'
            document.getElementById("UID").style.display = 'flex'
            score += 15
            ico[1].chk = '/images/info/check.png'
        break
        case 3://arrefecimento
            src = "./images/info/aqua.png"
            task = document.getElementById("imgs")
            document.getElementById("imgs").style.display = 'flex'
            document.getElementById("UID").style.display = 'flex'
            score += 25
            ico[2].chk = '/images/info/check.png'
        break
        case 4:
            document.getElementById("empilhadeira").style.backgroundImage = "url('./images/info/FlexEmp.gif')"
            document.getElementById("UID").style.display = 'flex'
            score += 10
            ico[3].chk = '/images/info/check.png'
        break
        case 5:
            document.getElementById("UID").style.display = 'flex'
            audio.play();
            score += 10
            ico[4].chk = '/images/info/check.png'
        break
        case 6:
            document.getElementById("list").style.display = 'flex'
            document.getElementById("batera").style.animationName = 'a'
            score += 10
        break
        case 7: //aqui é quando aperta na seta ele ira voltar como estava no incio
            document.getElementById("empilhadeira").style.backgroundImage = "url('./images/info/stopEmp.png')"
            document.getElementById("imgs").style.display = 'none'
            document.getElementById("Fundo").style.backgroundImage = "url('./images/background22.png')"
            document.getElementById("list").style.display = 'flex'
            document.getElementById("UID").style.display = 'none'
            document.getElementById("dialogo").style.display = 'none'
            roteiro.nxtTxt = 0
            task.style.display = 'none'
        break 
    }
}


</script>

<svelte:head>
    <link rel="stylesheet" href="/styles/empilhadeira.css" />
</svelte:head>

<div id="Window">
    <div id="Tela">
        <div id="Fundo"> 
            <div id="opa">
              

    <div id="list"> 
            <ul style="list-style: none;">
                {#each ico as { id, dd, chk} }
                    <li on:click={()=>{roteiro.dd = dd; lst(roteiro.dd); box()}}>
                        <img id="checkList" style="height: 65px;" src="{chk}" alt="">
                        <img src={id} alt="">           
                    <li/>
                {/each}
                <li on:click={()=>{roteiro.dd = 6; lst(roteiro.dd);document.getElementById("Fundo").style.backgroundImage = "url('./images/background221.png')";
                        roteiro.dd = 8;box()}}>
                    <img src="./images/info/bateria.png" alt="">
                </li>
                <div id="batera" ></div>
            </ul>
        </div>
        
     <div id="empilhadeira" />

</div> 

<div id="imgs"> 
    <ul id="lsbt">       
        <img src={src} alt="">
        {#if roteiro.dd == 1 && roteiro.nxtTxt == 3 }
        <img style="position: absolute;left:0;" src="/images/info/frapo.gif" alt="frapo">
        {:else if roteiro.dd == 1 && roteiro.nxtTxt == 4}
        <img style="position: absolute;left:0;" src="/images/info/frapoMelado.png" alt="frapo">
        {:else if roteiro.dd == 1 && roteiro.nxtTxt == 5}
        <img style="position: absolute;left:0;" src="/images/info/frapoMelado.png" alt="frapo">
        {:else if roteiro.dd == 2 && roteiro.nxtTxt == 7}
        <img style="position: absolute; left:0" src="/images/info/calibragem.gif" alt="calibrando">
        {:else if roteiro.dd == 2 && roteiro.nxtTxt >= 9 || roteiro.nxtTxt == 0}
        <img style="position: absolute; left:0" src="/images/info/pneuCheio.png" alt="cheio">
        {:else if roteiro.dd == 3 && roteiro.nxtTxt > 1 && roteiro.nxtTxt <= 3}
        <img style="position: absolute;;left:0;" src="/images/info/queimadura.gif" alt="queimou">
        {:else if roteiro.dd == 3 && roteiro.nxtTxt == 4 && roteiro.nxtTxt < 5 }
        <img style="position: absolute;left:0" src="/images/info/tampaarre.png" alt="">
        {:else if roteiro.dd == 3 && roteiro.nxtTxt >= 4}
        <img style="position:absolute; left:0;" src="/images/info/arrefecimentoAnim.gif" alt="testando">
        {/if}
    </ul>   
</div>

<div id="UID" style="display: none ; background-image: url('/images/seta.gif'); width:65px;" 
on:click={()=>{lst(7)}}/>

<div id="dialogo" on:click={() => {box()}} >    
    <p>{falar}</p> 
    <div id="seta" />  
</div>

{#if !((roteiro.txt - 1) > falar.length) }
    <div id="block" />
{/if}

         </div>
    </div> 
</div>

