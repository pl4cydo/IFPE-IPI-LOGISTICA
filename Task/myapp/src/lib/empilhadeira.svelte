<script>
    var src2;
    var src;
    var task;
    var falar = "";
    var roteiro = { txt: 1, nxtTxt: 0,dd:0};
    var audio = new Audio('./images/info/Siren.mp4');
    var ico = [{id: './images/info/oleo.png', dd:1  },
              { id: './images/info/pneu.png', dd:2 },
              { id: './images/info/arrefecimento.png', dd:3 },
              { id: './images/info/giroflex.png', dd:4 },
              { id: './images/info/som.png', dd:5 }];
    var F = [false,false,false,false,false,false,false,false]
             
    function box() {
        roteiro.nxtTxt++;
        roteiro.txt = 1;
        document.getElementById("dialogo").style.display = 'flex'

        let caixa = setInterval(() => {
                /*texto da caixa de dialogo*/
                 let text = [[/*inicio*/
                "",
                "Que bom ve-lo denovo",
                "Pelo jeito completou a missão anterior, e isso é otimo!",
                "Essa tarefa voce ira me ajudar a fazer o check-in",
                "Vamos prosseguir em outro local."],
                [/*motor*/"","motor","em cada um desses indcadores sao oleo para lubrifcaçao de diferentes partes da empilhadeira"],
                [/*pneu*/"","pneu","clique em um dos pneus para revirsarmos"/*,"oh ceus, grande erro meu continuar circulando dessa maneira",
                "e eu aqui ensinando boas maneiras","ironico nao?","vamos verificar os outros"*/],
                [/*arrefecimento*/"","agua"],[/*giroflex*/"",
                "essa luz luminosa é o giroflex","a funçao dele é avisar, para pessoas que estejam perto do equipamento, sobre seu deslocamento ou movimentação.","e esta funcionando normalmente"] ,
                [/*som de re*/"","som","função semelhante ao giroflex serve para alerta efetuamento da manobra"],
                ["a bateria esta prestes a acabar","clique no painel para poder carregar"] ,
                [/*oleo1*/"","Nossa...","esta em pessimo estado, a frente coloco um novo oleo"],
                ["","que otimo o oleo esta e bom estado, a coloração esta otima. nao precsamos trocar"] ];
            
                if (text[roteiro.dd].length == roteiro.nxtTxt) {
                    document.getElementById("dialogo").style.display = 'none' ;      
                    if (roteiro.nxtTxt == text[0].length ){
                        transiçao1()   
                    }
                    roteiro.nxtTxt = 0;
                    clearInterval(caixa);
                }
                falar = text[roteiro.dd][roteiro.nxtTxt].substring(0, roteiro.txt);
                roteiro.txt++;
            }, 50);
            
        }
        
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
        },1950);

    }

    var backgroundX = 0;

    const background = setInterval(() => {
        backgroundX += 3;
        document.getElementById("Fundo").style.backgroundPosition = backgroundX + "px";
        if (backgroundX > 2400) {
            clearInterval(background); 
            box();
        }
    }, 10);

    function lst(num){
        document.getElementById("list").style.display = 'none'
        switch (num) {
        case 1:
            task = document.getElementById("imgs")
            task.style.display = 'flex'
            src = "./images/info/motor.png"  
            document.getElementById("UID").style.display = 'flex'
        break;
        case 2:
            task = document.getElementById("rodas")
            task.style.display = 'grid'
            document.getElementById("UID").style.display = 'flex'
        break
        case 3:
            src = "./images/info/arerfe.png"
            document.getElementById("imgs").style.display = 'flex'
            document.getElementById("UID").style.display = 'flex'
        break
        case 4:
            document.getElementById("UID").style.display = 'flex'
        break
        case 5:
            document.getElementById("UID").style.display = 'flex'
            audio.play();
        break
        case 6:
            document.getElementById("list").style.display = 'flex'
            document.getElementById("batera").style.animationName = 'a'
            document.getElementById("UID").style.display = 'flex'
        break
        case 7:
            
        break
        case 8:
            document.getElementById("imgs").style.display = 'none'
            document.getElementById("list").style.display = 'flex'
            document.getElementById("UID").style.display = 'none'
            document.getElementById("Fundo").style.backgroundImage = "url('./images/background22.png')"
            task.style.display = 'none'
        break 
    }
}

function pontos(FinalPoints){
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
            <div id="energia" on:click={()=>{console.log("carregando")}}/> 
                <div id="opa">
                    <div id="transiçao" />

    <div id="list">
        <div id="mao"/>
            <ul style="list-style: none;">
                {#each ico as { id, dd} }
                    <li on:click={()=>{roteiro.dd = dd; lst(roteiro.dd)}}>
                        <img src={id} alt="">         
                    <li/>
                {/each}
                <li  on:click={()=>{roteiro.dd = 6; lst(roteiro.dd);document.getElementById("Fundo").style.backgroundImage = "url('./images/background221.png')"}}   >
                    <img src="./images/info/bateria.png" alt="">
                </li>
                <div id="batera"></div>
            </ul>
        </div>
        
        <div id="empilhadeira" >
            <ul id="rodas">
                <li on:click={()=>{F[3] = true; src = './images/info/roda furada.png';
                document.getElementById("imgs").style.display = 'flex'}}></li>
                <li on:click={()=>{F[4] = true; src = './images/info/rodanova.png';
                document.getElementById("imgs").style.display = 'flex'}}></li>
            </ul>
        </div>
 
</div> 
<div id="imgs"> 
    <ul id="lsbt">       
        <img src={src} alt="">
        <li id="vareta1" on:click={()=>{F[2] = true;roteiro.dd = 7;box(); src2 = './images/info/vareta boa.png'}}>ccc</li>
        <li id="vareta2" on:click={()=>{F[2] = true;roteiro.dd = 8;box(); src2 = './images/info/vareta rm.png'}}>ccc</li>
        <li id="vareta3" on:click={()=>{F[2] = true;roteiro.dd = 7;box(); src2 = './images/info/vareta rm.png'}}>ccc</li>
        <li id="agua" style="display: none;">aaaaaa</li>
    </ul> 
    
</div>
<div id="UID" on:click={()=>{lst(8); pontos()}}/>
<div on:click={() => {box()}} id="dialogo">    
        <p>{falar}</p> 
        <div id="seta" />  
</div> 
</div>
</div> 
</div>

