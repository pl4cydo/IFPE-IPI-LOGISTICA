<svelte:head>
    <link rel="stylesheet" href="/styles/recebimento.css">
</svelte:head>

<div id="recContainer">
    <div id="recScreen">
        <div id="dialogueArea">            
            <div id="dialogueBox">
                <p>
                O caminhão com a encomenda passou pela verificação de entrada e está prestes a chegar na doca. <br>
                </p>
            </div>
            <div id="btnArea">
                <div id="skipBtn" on:click={()=>trocarCenario("recScreen")}>Avançar</div>
            </div>
        </div>
    </div>
    <div id="blackScreen"></div>
</div>
<script>
    function trocarCenario(el){
        let element = document.getElementById(el)
        let screen = document.getElementById("blackScreen")

        screen.style.display = "block"
        screen.classList.add("opacityAnimation")
        
        setInterval(() => {
            element.style.backgroundImage = "url(/images/docaAberta768.png)"
            setInterval(() => {
                screen.style.display = "none"
            }, 4000);
        }, 2000);        
    }
</script>