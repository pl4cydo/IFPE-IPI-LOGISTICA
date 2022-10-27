<svelte:head>
    <link rel="stylesheet" href="/styles/epi.css">
</svelte:head>
<div id="epiContainer">
    <div id="epiScreen">
        <div id="locker" on:click={openLocker}>
            <img src="/images/locker.png" alt="">
        </div>
        <div id="epiStorage">
            <h1>INVENTARIO DO ARMARIO</h1>
            <div id="itens">
                <div class="slots"><img id="helmet" src="/images/helmet.png" alt="helmet" on:click={() => openItem("helmetCard")} ></div>
                <div class="slots"></div>
                <div class="slots"></div>
                <div class="slots"></div>
                <div class="slots"><img id="glasses" src="/images/glasses.png" alt="glasses" on:click={() => openItem("glassesCard")}></div>
                <div class="slots"></div>
                <div class="slots"></div>
                <div class="slots"></div>
                <div class="slots"><img id="colete" src="/images/colete.png" alt="colete" on:click={() => openItem("coleteCard") }></div>
                <div class="slots"></div>
                <div class="slots"></div>
                <div class="slots"></div>
                <div class="slots"><img id="glove" src="/images/glove.png" alt="glove" on:click={() => openItem("gloveCard")}></div>
                <div class="slots"></div>
                <div class="slots"></div>
                <div class="slots"></div>
            </div>
        </div>
        
        <div id="helmetCard">
            <div class="item_Name">
                <h1>Capacete de Segurança</h1>
            </div>
            <div class="cardInfo">
                <img src="/images/helmet.png" alt="glove">
            </div>            
            <div class="item_Description">
                <h1>Descrição do item</h1>
                <p>Este item tem a capacidade de proteger a sua cabeça de possiveis riscos e acidentes de trabalho.</p>
            </div>
            <div class="btnArea">
                <div class="confirmBtn" on:click={() => equipItem("#helmetCard","helmet")}>EQUIPAR</div>
            </div>
        </div><!--fim do helmet-->
        
        <div id="glassesCard">
            <div class="item_Name">
                <h1>oculos de Segurança</h1>
            </div>
            <div class="cardInfo">
                <img src="/images/glasses.png" alt="glove">
            </div>            
            <div class="item_Description">
                <h1>Descrição do item</h1>
                <p>Este item tem a capacidade proteger a seu olho de possiveis riscos e acidentes de trabalho.</p>
            </div>
            <div class="btnArea">
                <div class="confirmBtn" on:click={() => equipItem("#glassesCard","glasses")}>EQUIPAR</div>
            </div>
        </div> <!--fim do glasses-->

        <div id="gloveCard">
            <div class="item_Name">
                <h1>Luva de Segurança</h1>
            </div>
            <div class="cardInfo">
                <img src="/images/glove.png" alt="glove">
            </div>            
            <div class="item_Description">
                <h1>Descrição do item</h1>
                <p>As luvas de proteção tem a capacidade de proteger a sua mão de possiveis riscos e acidentes no local de trabalho.</p>
            </div>
            <div class="btnArea">
                <div class="confirmBtn" on:click={() => equipItem("#gloveCard","glove")}>EQUIPAR</div>
            </div>
        </div> <!--fim do glove-->
        
        <div id="coleteCard">
            <div class="item_Name">
                <h1>Colete Refletivo</h1>
            </div>
            <div class="cardInfo">
                <img src="/images/colete.png" alt="glove">
            </div>            
            <div class="item_Description">
                <h1>Descrição do item</h1>
                <p>O colete refletivo sei la oque escrever dps eu vejo</p>
            </div>
            <div class="btnArea">
                <div class="confirmBtn" on:click={() => equipItem("#coleteCard","colete")}>EQUIPAR</div>
            </div>
        </div> <!--fim do colete-->

    </div>
    
</div>
<script>
    class playerEpi{
        constructor(helmet,glasses,colete,glove){
            this.helmet = helmet;
            this.glasses = glasses;
            this.colete = colete;
            this.glove = glove;
        }
    }

    let worker = new playerEpi(false,false,false,false)

    function openLocker(){
        let stor = document.getElementById("epiStorage")
        stor.style.display = "flex"

        //document.getElementById("locker").style.display = "none"
    }
    function openItem(el){
        
        let item = document.getElementById(el)
        item.style.display = "flex"
    }

    function equipItem(el,epi){

        let card = document.querySelector(el)
        card.classList.add("cardShakeAniamtion")
        let clickedItem = document.getElementById(epi)
        setInterval(() => {
            card.classList.add("cardOutAnimation")
        
            if(epi === "helmet"){
                worker.helmet = true 
                clickedItem.classList.add("hiddenAnimation")

            }else if(epi === "glove"){
                worker.glove = true
                clickedItem.classList.add("hiddenAnimation")

            }else if(epi === "colete"){
                worker.colete = true
                clickedItem.classList.add("hiddenAnimation")

            }else if(epi === "glasses"){
                worker.glasses = true
                clickedItem.classList.add("hiddenAnimation")
            }
            taskFInished()
            setInterval(() => {
                card.style.display = "none"
            }, 2500);
            
        }, 1450);
    }

    function taskFInished(){
        if(worker.helmet && worker.glasses && worker.colete && worker.glove){
            console.log("tudo equipado")
        }
    }
</script>