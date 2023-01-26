<svelte:head>
    <link rel="stylesheet" href="/styles/recebimento.css">
</svelte:head>


<div id="recScreen">
    <!-- <button on:click={() => areatest()}>1</button> -->
    <div id="dialogueArea">            
        <div id="dialogueBox">
            <p id="p1" style="display:block;">
                O caminhão com a carga passou pela verificação de entrada e está prestes a chegar na doca.
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
            <p id="p8" style="display:none;">Todas as notas foram conferidas com sucesso</p>

        </div>
        
        <div id="btnArea">
            <div id="changeBtn" style="color:white;background:dodgerblue; display:none;" on:click={()=>{changeNf()}}>Trocar</div>
            <div on:click={()=>{verificarNota(cargaAtual,selectedNote)}} id="approveBtn" style="color:white;background:green; display:none;">Aprovar</div><!--Chama a Funcao Que Verifica Se a Nota Verificada Está Correta.-->
            <div id="skipBtn" on:click={()=>{trocarCenario("recScreen")}}>Avançar</div><!-- Chama a Funcao Que Altera a Imagem De fundo Do Jogo Para a Imagem Com a Doca Aberta.-->
        </div>
    </div>
    <div id="carga" style="display: none;" on:click={()=>{toggleElement("recTask"),changeDialogues("p2","p3"),toggleElement("approveBtn"),toggleElement("changeBtn")}}></div> <!--Altera a Visibilidade do recTask, Troca o Dialogo do 2 Para o 3, Altera a Visibilidade Dos Botões de Interação.-->
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
                        <h1>Lote</h1>
                        <p>{selectedNote.lote}</p>
                    </div>
                    <div class="encInfo">
                        <h1>Fornecedor</h1>
                        <p>{selectedNote.fornecedor}</p>
                    </div>
                    <div class="encInfo">
                        <h1>Produto</h1>
                        <p>{selectedNote.produto}</p>
                    </div>
                    <div class="encInfo">
                        <h1>Validade</h1>
                        <p>{selectedNote.validade}</p>
                    </div>
                    <div class="encInfo">
                        <h1>Quantidade</h1>
                        <p>{selectedNote.quantidade}</p>
                    </div>
                    <div class="encInfo">
                        <h1>Caixas</h1>
                        <p>{selectedNote.caixas}</p>
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
    <div id="blackScreen" style="display: none;"></div>
    <div id="endScreen" style="display:none;">
        <h1>Missão concluida</h1>
        <h3>Pontuação Final: {recPoints}</h3>
        <h1>Processo de Recebimento</h1>
        <p>No processo de armazenagem logistica, o ponto de recebimento é de grande importância. Esse ponto lida com o recebimento de produtos e a verificação dos mesmos. Esse processo é dividido em três partes:</p>
        <h4>Conferência da mercadoria</h4>
        <p>Assim que as mercadorias chegam no local de estocagem elas passam pelo processo de Conferência, no qual são avaliados detalhes como:estado do material, número de série, fabricação, validade, e lote.</p>
        <h4>Inspeção</h4>
        <p>Após a análise mais técnica feita da Conferência, você parte para a Inspeção no qual se verificam possíveis avarias ou não conformidades nos produtos</p>
        <h4>Identificação das mercadorias</h4>
        <p>A identificação é a sub etapa em que a mercadoria ganha um código de barras que será utilizado como principal referência em outras ações subsequentes, como contagem ou movimentação dentro do estoque.</p>
        <a href="https://www.twtransportes.com.br/logistica-de-armazenagem-por-que-e-importante/#:~:text=A%20log%C3%ADstica%20de%20armazenagem%20funciona,ter%20mais%20economia%20e%20resultado." target="_blank">Para mais informações</a>
        <div on:click={() => backToLobbyRec()} id="backToLobby">Continuar</div>
    </div>
</div>
<script>
    import { infoTasks1, taskOrder, totalPoints, walk } from "../stores"


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

    let recPoints = 0
    let changeLock = false  // Variavel Que Bloqueia a Função de Trocar Nota.
    let approveLock = false // Variavel Que Bloqueia a Função de Aprovar Nota.
    let progresso = 4 // Variavel Com a Quantidade Restante de Notas.
    let cargaAtual = encomenda1 // Variavel com a Carga atual
    let selectedNote = encomenda1 // Variavel Que Recebe a Carga Selecionada. 
    let nf = "" // Recebe ID do Elemento clicado na Seleção da Nota.
    function trocarCenario(el){ // Função Que Troca o Cenário do Jogo.
        let element = document.getElementById(el) // Define o Elemento a Ser Alterado.
        let screen = document.getElementById("blackScreen") // Tela Para Transição do Cenário.
        toggleElement("blackScreen") // Deixado Visivel a Tela Preta de Transição.
        screen.classList.add("opacityAnimation") // Adicionando Classe Com Animação de Opacidade na Tela Preta.
        setTimeout(() => {
            element.style.backgroundImage = "url(/images/docaAberta768.png)" // Trocando a Imagem de Fundo.
            setTimeout(() => {
                toggleElement("blackScreen") // Removendo a Visibilidade da Tela Preta.
            }, 3200);
            toggleElement("skipBtn") // Removendo a Visibilidade do Botão de Avançar.
            toggleElement("carga") // Deixando a visivel o Elemento Clicavel Para Iniciar a Conferir.
            changeDialogues("p1","p2") // Trocando do Dialogo 1 para o 2
        }, 2000);       
    }

    function changeDialogues(paragraph1,paragraph2){ // Função Que Troca Os Dialogos do Jogo.
        paragraph1 = document.getElementById(paragraph1) // Definindo Dialogo 1
        paragraph2 = document.getElementById(paragraph2) // Definindo Dialogo 2

        if(paragraph1.style.display ==="block"){ // Se Dialogo 1 Está Visivel...
            paragraph1.style.display = "none" // Remover Visibilidade do Dialogo 1
            paragraph2.style.display = "block" // Deixar Visivel o Dialogo 2

        }
    }

    function toggleElement(el){ // Funcão Que Altera o Display Dos Elementos Para Desaparecer e Ficar Visiveis
        let element = document.getElementById(el)
        if(element.style.display === "none"){
            element.style.display = "flex"
        }
        else{
            element.style.display = "none"
        }
    }

    function selectNote(note){ // Função Que Seleciona a Nota Fiscal Que Vai Ser Verificada.
        changeLock = !changeLock // Desbloqueia a Função do Botão de Trocar Nota.
        approveLock = !approveLock // Desbloqueia a Função do Botão de Aprovar Nota.
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
        console.log(selectedNote)

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
    function verificarNota(currentNF,selectedNf){ // Função Que Verifica a Nota Atual Com a Nota Selecionada.
        if(approveLock){ // Verifica a Nota Apenas Quando a Existe Uma Nota Selecionada.
            if(currentNF === selectedNf){
                console.log("certa")
                changeLock = !changeLock
                progresso--
                approveLock = !approveLock
                recPoints += 100
                if(progresso == 0){
                    changeDialogues("p3","p8")  
                    toggleElement("recTask")
                    toggleElement("approveBtn")
                    toggleElement("changeBtn")
                    setTimeout(()=> {
                        recScreen.style.border = "none"
                        toggleElement("endScreen")
                    },2000)
                }
                else{
                    changeDialogues("p3","p7")
                    setTimeout(() => {
                        changeDialogues("p7","p3")
                        toggleElement("teste")
                    },2500);
                }
                toggleElement("notaSelecionada")
                toggleElement(nf) // Remove a Visibilidade da Nota Aprovada
                
                if(progresso === 3){  
                cargaAtual = encomenda3 // Altera a Carga Que Vai Ser Verificada.
                }
                else if(progresso === 2){
                cargaAtual = encomenda2 // Altera a Carga Que Vai Ser Verificada.
                }
                else if(progresso === 1){
                cargaAtual = encomenda4 // Altera a Carga Que Vai Ser Verificada.
                }
                
            }else{
                changeDialogues("p3","p5")
                recPoints -= 19
            }
        }else{ // Alerta Que Não Possui Nota selecionada 
            changeDialogues("p3","p4")
            setTimeout(() => {
                changeDialogues("p4","p3")
            }, 3000);
        }     
    }
    function backToLobbyRec() {
        console.log("backToLobbyRec")
        $totalPoints += recPoints;
        $walk = true;
        game.style.display = "flex";
        recScreen.style.display = "none";
        $infoTasks1 = "COMPLETO!";
        $taskOrder.t1 = false;
        $taskOrder.t2 = true;
    }

    // const areatest = () => {
    //     // changeDialogues("p3","p8")  
    //     // toggleElement("recTask")
    //     // toggleElement("approveBtn")
    //     // toggleElement("changeBtn")
    //     toggleElement("endScreen")

    // }
</script>   