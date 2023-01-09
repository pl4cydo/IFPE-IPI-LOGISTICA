<script>
    var end = false //essa funçao é um liga e desliga somente
    var src2; // aqui armazena o local do arquivo
    var src; // o mesmo se aplica a varivel acima
    var task; //aqui armazenda o id da tag html provavelmente seja desnecessario
    var falar = "";// e necessario a variavel para a aplicaçao de cada letra para forma o texto e precisa ser global para que o svelte reconheça e aplique na tag
    var roteiro = { txt: 1, nxtTxt: 0,dd:0}; // cada um desses são referentes ao texto; txt é para cada letra; nxtTxt é para o prox texto dentro do array; dd deterina um outro array
    var audio = new Audio('./images/info/Siren.mp4');//audio apenas
    var ico = [{id: './images/info/oleo.png', dd:1  }, // lista de imagens para a lista de botoes
              { id: './images/info/pneu.png', dd:2 },
              { id: './images/info/arrefecimento.png', dd:3 },
              { id: './images/info/giroflex.png', dd:4 },
              { id: './images/info/som.png', dd:5 }];
    var F = [false,false,false,false,false,false,false,false,false] // cadad uma corresponde a uma das taks 
             
    function box() {//aqui é onde forma letra por letra na box de dialogos
        roteiro.nxtTxt++;
        roteiro.txt = 1;
        document.getElementById("dialogo").style.display = 'flex'
        //dentro de um set interval para colocar letra por letra
        let caixa = setInterval(() => {
                /*texto da caixa de dialogo*/
                 let text = [[/*inicio*/
                "",//tudo isso aqui é todo o texto da task, porem nao esta de forma cronologica vamos assim dizer
                "Que bom ve-lo denovo",
                "Pelo jeito completou a missão anterior, e isso é otimo!",
                "Essa tarefa voce ira me ajudar a fazer o check-list",
                "Vamos prosseguir em outro local."],
                [/*motor*/"","motor","em cada um desses indcadores sao oleo para lubrifcaçao de diferentes partes da empilhadeira"],
                [/*pneu*/"","pneu","clique em um dos pneus para revirsarmos"],
                [/*arrefecimento*/"","arrefecimento","o radiador é uma peça que serve de resfriamento do motor","arrefecimento significa desaparacimento de calor."
                 ,"nesta tampa laranja se tem um liquido para o uso exclusiivo do radiador","vamos revisar"/*esta com o nivel ideal para o funcionamento*/],[/*giroflex*/"",
                "essa luz luminosa é o giroflex","a funçao dele é avisar, para pessoas que estejam perto do equipamento, sobre seu deslocamento ou movimentação.","e esta funcionando normalmente"] ,
                [/*som de re*/"","som","função semelhante ao giroflex serve para alerta efetuamento da manobra"],
                ["a bateria esta prestes a acabar","clique no painel para poder carregar"] ,
                [/*oleo1*/"","Nossa...","esta em pessimo estado, a frente coloco um novo oleo"],
                ["","que otimo o oleo esta e bom estado, a coloração esta otima. nao precsamos trocar"],
                ["","Bom aq ao lado esq temos uma lista, e cada um deles irá verifcar partes da emplhadiera que são essenciais para o funcionamento do mesmo.",
                "lembrando qe O BOTAO VERDE é para finalizaçao da task","dado essa inforaçao podemos continuar"],["","oh ceus, grande erro meu continuar circulando dessa maneira",
                "e eu aqui ensinando boas maneiras","ironico nao?","vamos verificar os outro"],["","o pneu esta em bom estado não sera necessario a troca","o outro lado da empiçhadeira irei revisar pode ficar tranquilo"],
                ["","o nivel da água esta normal","vamos revisar mais"],["","existem empilhadeiras que utilizam combustivel","mas também existem empilhadeiras eletricas que diminuem poluição dentro e fora da empresa","bom... acho que a bateria esta cheia"]];
                
                if (text[roteiro.dd].length == roteiro.nxtTxt) {
                    document.getElementById("dialogo").style.display = 'none' ;    
                    //esse if é um caso a aparte, somente quando ele pegar o primeiro texto e terminar. ele ira fazer a transiçao   
                    if (roteiro.nxtTxt == text[0].length ){
                        transiçao1()   
                    }
                    //aqui é um reset. é necessario pois se caso solicitar o dialogo, ele nao pegara do meio do texto ou final
                    roteiro.nxtTxt = 0;
                    clearInterval(caixa);
                }
                falar = text[roteiro.dd][roteiro.nxtTxt].substring(0, roteiro.txt);
                roteiro.txt++;
            }, 50);
            
        }
        //essa função faz a mudança do cenario ativaçao da lista de botoes, animaçao da empilhadeira e umas coisas ai
        function transiçao1( ) {
        document.getElementById("transiçao").style.animationName = 'desvanecer'
        document.getElementById("dialogo").style.display = "none";
        document.getElementById("empilhadeira").style.animationName = 'mymove2';
        document.getElementById("Fundo").style.backgroundPosition = 0 + "px";
        setTimeout(()=>{
            document.getElementById("Fundo").style.backgroundImage = "url('./images/background22.png')"; 
            document.getElementById("empilhadeira").style.animationName = 'mymove';
            document.getElementById("Fundo").style.backgroundSize = '100% 100%'; 
            document.getElementById("list").style.display = 'flex'
            document.getElementById("UID").style.display = 'flex'
            roteiro.dd = 9;box();
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
        end = true
        switch (num) {
        case 1://exemplo: esse é o motor 
            task = document.getElementById("imgs")
            task.style.display = 'flex'
            src = "./images/info/motor.png"  
            document.getElementById("UID").style.display = 'flex'
        break;
        case 2://rodas
            task = document.getElementById("rodas")
            task.style.display = 'grid'
            document.getElementById("UID").style.display = 'flex'
        break
        case 3://arrefecimento
            src = "./images/info/arerfe.png"
            document.getElementById("imgs").style.display = 'flex'
            document.getElementById("UID").style.display = 'flex'
            F[5] = true
        break
        case 4:
            document.getElementById("UID").style.display = 'flex'
            F[6] = true
        break
        case 5:
            document.getElementById("UID").style.display = 'flex'
            audio.play();
            F[7] = true
        break
        case 6:
            document.getElementById("list").style.display = 'flex'
            document.getElementById("batera").style.animationName = 'a'
            document.getElementById("UID").style.display = 'flex'
            F[8] = true
        break
        case 7: //aqui é quando aperta na seta ele ira voltar como estava no incio
            end = false
            document.getElementById("imgs").style.display = 'none'
            document.getElementById("Fundo").style.backgroundImage = "url('./images/background22.png')"
            document.getElementById("list").style.display = 'flex'
            task.style.display = 'none'
            document.getElementById("UID").style.display = 'flex' 
        break 
    }
}

function pontos(FinalPoints){ //aqui o contador de pontos
    let score = 80
    for(let i=0;i < F.length; i++){
        if(!F[i]){
            score -= 10
            console.log(score)
        }
    }
    return score
}
 

 
</script>

<svelte:head>
    <link rel="stylesheet" href="/styles/empilhadeira.css" />
</svelte:head>

<div id="Window">
    <div id="Tela">
        <div id="Fundo"> 
            <div id="opa">
              <div id="transiçao" />

    <div id="list"> 
            <ul style="list-style: none;">
                {#each ico as { id, dd} }
                    <li on:click={()=>{roteiro.dd = dd; lst(roteiro.dd); box()}}>
                        <img src={id} alt="">         
                    <li/>
                {/each}
                <li  on:click={()=>{roteiro.dd = 6; lst(roteiro.dd);document.getElementById("Fundo").style.backgroundImage = "url('./images/background221.png')";
                        roteiro.dd = 13;box()}}>
                    <img src="./images/info/bateria.png" alt="">
                </li>
                <div id="batera" ></div>
            </ul>
        </div>
        
        <div id="empilhadeira" >
            <ul id="rodas">
                <li on:click={()=>{F[4] = true; src = './images/info/roda furada.png';
                document.getElementById("imgs").style.display = 'flex';roteiro.dd = 11 ; box()}}></li>
                <li on:click={()=>{F[3] = true; src = './images/info/rodanova.png';
                document.getElementById("imgs").style.display = 'flex';roteiro.dd = 12; box()}}></li>
            </ul>
        </div>
 
</div> 
<div id="imgs"> 
    <ul id="lsbt">       
        <img src={src} alt="">
        {#if src === "./images/info/motor.png"}
        <li id="vareta1" on:click={()=>{F[2] = true;roteiro.dd = 7;box(); src2 = './images/info/vareta boa.png'}}>ccc</li>
        <li id="vareta2" on:click={()=>{F[1] = true;roteiro.dd = 8;box(); src2 = './images/info/vareta rm.png'}}>ccc</li>
        <li id="vareta3" on:click={()=>{F[0] = true;roteiro.dd = 7;box(); src2 = './images/info/vareta rm.png'}}>ccc</li>
        {:else if src === "./images/info/arerfe.png"}
        <li id="agua" style="display: flex;" on:click={()=>{console.log("teste");roteiro.dd = 12; box()}}>aaaaaa</li>
        {/if}
    </ul> 
    
</div>
{#if end }
<div id="UID" style="display: flex ; background-image: url('/images/seta.gif');" on:click={()=>{lst(7)}}/>
{:else}
<div id="UID" style="display: flex ; background-image: url('/images/conf.png');" on:click={()=>{pontos(); document.getElementById("Window").style.display = 'none'; }}/>
 {/if}
<div on:click={() => {box()}} id="dialogo">    
        <p>{falar}</p> 
        <div id="seta" />  
</div> 
</div>
</div> 
</div>

