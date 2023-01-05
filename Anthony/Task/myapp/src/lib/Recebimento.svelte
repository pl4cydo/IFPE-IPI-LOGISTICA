<svelte:head>
    <link rel="stylesheet" href="/styles/recebimento.css">
</svelte:head>

<div id="recContainer">
    <div id="recScreen">
        <div id="dialogueArea">            
            <div id="dialogueBox">
                <p id="p1" style="display:block;">
                    O caminhão com a encomenda passou pela verificação de entrada e está prestes a chegar na doca.
                </p>
                <p id="p2" style="display: none;">
                    Clique na carga para verificar se ela está de acordo com a nota fiscal da encomenda.
                </p>
                <p id="p3" style="display:none;">
                    Selecione umas das notas na direita, caso ela corresponda com a nota atual clique em <span style="color:green">Aprovar</span> caso contrario clique em <span style="color:dodgerblue;">Trocar</span>.
                </p>
                <p id="p4" style="display:none;">
                    Você precisa selecionar uma nota antes de aprovar.
                </p>
                <p id="p5" style="display:none;">
                    Esta nota não corresponde com a atual selecione outra nota clicando em <span style="color:dodgerblue;">Trocar</span>.
                </p>
                <p id="p6" style="display:none;">
                    Selecione uma nota antes de clicar em trocar.
                </p>
                <p id="p7" style="display:none;">
                    Nota conferida com <span style="color: green;">sucesso</span>, Continue verificando as notas.
                </p>

            </div>
          
            <div id="btnArea">
                <div id="changeBtn" style="color:white;background:dodgerblue; display:none;" on:click={()=>{changeNf()}}>Trocar</div>
                <div on:click={()=>{verificarNota(cargaAtual,selectedNote)}} id="approveBtn" style="color:white;background:green; display:none;">Aprovar</div>
                <div id="skipBtn" on:click={()=>{trocarCenario("recScreen")}}>Avançar</div>
            </div>
        </div>
        <div id="carga" style="display: none;" on:click={()=>{toggleElement("recTask"),changeDialogues("p2","p3"),toggleElement("approveBtn"),toggleElement("changeBtn")}}></div>
        <div id="recTask" style="display: none;">
            <div id="encomendaArea">
                <div class="notaEncomenda">
                    <div class="nfID"><h1>Nota atual</h1></div>
                    <div class="encInfo">
                        <h1>Fornecedor</h1>
                        <p>{cargaAtual.fornecedor}</p>
                    </div>
                    <div class="encInfo">
                        <h1>Produto</h1>
                        <p>{cargaAtual.produto}</p>
                    </div>
                    <div class="encInfo">
                        <h1>Caixas</h1>
                        <p>{cargaAtual.caixas}</p>
                    </div>
                    <div class="encInfo">
                        <h1>Quantidade</h1>
                        <p>{cargaAtual.quantidade}</p>
                    </div>
                    <div class="encInfo">
                        <h1>Validade</h1>
                        <p>{cargaAtual.validade}</p>
                    </div>
                    <div class="encInfo">
                        <h1>Lote</h1>
                        <p>{cargaAtual.lote}</p>
                    </div>
                </div>
            </div>
            <div id="nfArea">
                
                <div id="teste" style="display:none;">
                    <div class="notaEncomenda" id="notaSelecionada" style="display:none;">
                        <div class="nfID"><h1>{selectedNote.nota}</h1></div>
                        <div class="encInfo">
                            <h1>Fornecedor</h1>
                            <p>{selectedNote.fornecedor}</p>
                        </div>
                        <div class="encInfo">
                            <h1>Produto</h1>
                            <p>{selectedNote.produto}</p>
                        </div>
                        <div class="encInfo">
                            <h1>Caixas</h1>
                            <p>{selectedNote.caixas}</p>
                        </div>
                        <div class="encInfo">
                            <h1>Quantidade</h1>
                            <p>{selectedNote.quantidade}</p>
                        </div>
                        <div class="encInfo">
                            <h1>Validade</h1>
                            <p>{selectedNote.validade}</p>
                        </div>
                        <div class="encInfo">
                            <h1>Lote</h1>
                            <p>{selectedNote.lote}</p>
                        </div>
                    </div>
                </div>

                <div id="notasFiscais">
                    <div class="nf" id="nf1" on:click={()=>{selectNote("nota1"),toggleElement("teste")}}><h1>Nota Fiscal 1</h1></div>
                    <div class="nf" id="nf2" on:click={()=>{selectNote("nota2"),toggleElement("teste")}}><h1>Nota Fiscal 2</h1></div>
                    <div class="nf" id="nf3" on:click={()=>{selectNote("nota3"),toggleElement("teste")}}><h1>Nota Fiscal 3</h1></div>
                    <div class="nf" id="nf4" on:click={()=>{selectNote("nota4"),toggleElement("teste")}}><h1>Nota Fiscal 4</h1></div>
                </div>

            </div>
        </div>    
    </div>
    <div id="blackScreen" style="display: none;"></div>
    
</div>

<script>
    let docaFechada = true
    class notaFiscal {
        constructor(nota,fornecedor,produto,caixas,quantidade,validade,lote){
            this.nota = nota
            this.fornecedor = fornecedor
            this.produto = produto
            this.caixas = caixas
            this.quantidade = quantidade
            this.validade = validade
            this.lote = lote
        }
    }
    let encomenda1 = new notaFiscal("Nota 1","JP878L","Produto1",9,170,"10/10/2023","TP457LQ67",)
    let encomenda2 = new notaFiscal("Nota 2","JP878L","Produto2",9,135,"12/5/2023","EL1P46S4B")
    let encomenda3 = new notaFiscal("Nota 3","JP878L","Produto3",9,100,"1/5/2024","YR8JK7B4T")
    let encomenda4 = new notaFiscal("Nota 4","JP878L","Produto4",9,90,"15/5/2024","ZQ4W7ERTY")
    
    let nf = ""
    let changeLock = false
    let approveLock = false
    let progresso = 4
    let cargaAtual = encomenda1
    let selectedNote = encomenda1   
    function trocarCenario(el){
        let element = document.getElementById(el)
        let screen = document.getElementById("blackScreen")
        if(docaFechada){
            toggleElement("blackScreen")
            screen.classList.add("opacityAnimation")
            setTimeout(() => {
                element.style.backgroundImage = "url(/images/docaAberta768.png)"
                setTimeout(() => {
                    toggleElement("blackScreen")
                }, 3200);
                toggleElement("skipBtn")
                toggleElement("carga")
                changeDialogues("p1","p2")
            }, 2000);
            docaFechada = false        
        }
    }
    function changeDialogues(paragraph1,paragraph2){
        paragraph1 = document.getElementById(paragraph1)
        paragraph2 = document.getElementById(paragraph2)

        if(paragraph1.style.display ==="block"){
            paragraph1.style.display = "none"
            paragraph2.style.display = "block"

        }
    }

    function toggleElement(el){
        let element = document.getElementById(el)
        if(element.style.display === "none"){
            element.style.display = "flex"
        }
        else{
            element.style.display = "none"
        }
    }

    function selectNote(note){
        changeLock = !changeLock
        approveLock = !approveLock
        if(note === "nota1"){
            selectedNote = encomenda1
            nf = "nf1"
        }
        else if(note === "nota2"){
            selectedNote = encomenda2
            nf = "nf2"
        }
        else if(note === "nota3"){
            selectedNote = encomenda3
            nf = "nf3"
        }
        else if(note = "nota4"){
            selectedNote = encomenda4
            nf = "nf4"
        }
        toggleElement("notaSelecionada")

    }
    function changeNf(){
        if(changeLock){
            changeDialogues("p5","p3")
            changeLock = !changeLock
            approveLock = !approveLock
            toggleElement("teste")
            toggleElement("notaSelecionada")
        }else{
            changeDialogues("p3","p6")
            setTimeout(() => {
                changeDialogues("p6","p3")
            }, 2500);
        }
    }
    function verificarNota(currentNF,selectedNf){
        if(approveLock){
            if(currentNF === selectedNf){
                approveLock = !approveLock
                progresso--
                changeLock = !changeLock
                toggleElement(nf)
                toggleElement("notaSelecionada")
                changeDialogues("p3","p7")
                setTimeout(() => {
                    toggleElement("teste")
                    changeDialogues("p7","p3")
                }, 4500);
                if(progresso === 3){
                cargaAtual = encomenda3
                }
                else if(progresso === 2){
                cargaAtual = encomenda2
                }
                else if(progresso === 1){
                cargaAtual = encomenda4
                
                }
            }else{
                changeDialogues("p3","p5")
            }
        }else{
            changeDialogues("p3","p4")
            setTimeout(() => {
            changeDialogues("p4","p3")
            }, 3000);
        }
    }

</script>   