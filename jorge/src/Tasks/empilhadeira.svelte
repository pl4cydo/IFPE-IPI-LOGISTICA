<script>
    var falar = "";
    var roteiro = { txt: 1, nxtTxt: 0 };

    function teste() {
        roteiro.nxtTxt++;
        roteiro.txt = 1;
        let caixa = setInterval(() => {
            let text = [
                "",
                "Que bom ve-lo denovo",
                "Pelo jeito completou a missão anterior, e isso é otimo!",
                "Essa tarefa voce ira me ajudar a fazer o check-in",
                "Vamos prosseguir em outro local."
            ];
            if (text.length == roteiro.nxtTxt) {
                clearInterval(caixa);
                transiçao();
            }
            falar = text[roteiro.nxtTxt].substring(0, roteiro.txt);
            roteiro.txt++;
        }, 50);
    }
    
    function transiçao(){
        let opacity1 = 0;
        document.getElementById("empiadeira").style.animationName = "mymove2";
        document.getElementById("dialogo").style.display = "none";
        let desvanecer = setInterval(()=>{
        if(opacity1 < 100){
            opacity1++
            document.getElementById("transiçao").style.opacity = opacity1 + "%" 
        }else{
            clearInterval(desvanecer);
        }
        },25);
      //  document.getElementById("Fundo").style.backgroundImage = "url('')";
    }

    var backgroundX = 0;

    const background = setInterval(() => {
        backgroundX += 3;
        document.getElementById("Fundo").style.backgroundPosition = backgroundX + "px";
        if (backgroundX > 2500) {
            clearInterval(background);
            document.getElementById("dialogo").style.display = "flex";
            teste();
        }
    }, 10);

</script>

<svelte:head>
    <link rel="stylesheet" href="/styles/empilhadeira.css" />
</svelte:head>
<div id="Window">
    <div id="Tela">
        <div id="Fundo">
            <div id="empiadeira">
                <img src="./images/empiadeira1.gif" alt="" />
            </div>
            <div id="transiçao">
            </div>
            <div id="prancheta">
                <div id="folha">
                    <label for="">
                        <input type="checkbox" />  
                        <p></p>
                        <input type="checkbox" />
                        <p></p>
                        <input type="checkbox" />
                        <input type="checkbox" />
                        <input type="checkbox" />
                        <input type="checkbox" />
                        <input type="checkbox" />
                    </label>
                </div>
            </div>
        </div>
        <div on:click={() => { teste();  console.log("avançar"); }}  id="dialogo">
            <p>{falar}</p>
            <div id="seta">
                <img src="./images/seta.gif" alt="" />
            </div>
        </div>
    </div>
</div>
