<svelte:head>
    <link rel="stylesheet" href="/styles/epi.css">
</svelte:head>
<div id="epiContainer">
    <div id="epiScreen">
        <div id="locker" on:click={()=>{openItem("epiStorage")}}>
            <img src="/images/locker.png" alt="">
        </div>
        <div id="epiStorage" style="display: none;">
            <h1>INVENTARIO DO ARMARIO</h1>
            <div id="itens">
                <div class="slots"><img id="helmet_img" src="/images/helmet.png" alt="helmet" on:click={() => openItem("helmet")} ></div>
                <div class="slots"><span style="cursor: pointer;" on:click={()=>openItem("ndf5")}>item errado</span></div>
                <div class="slots">item errado</div>
                <div class="slots">item errado</div>
                <div class="slots"><img id="glasses_img" src="/images/glasses.png" alt="glasses" on:click={() => openItem("glasses")}></div>
                <div class="slots">item errado</div>
                <div class="slots">item errado</div>
                <div class="slots"><span style="cursor: pointer;" on:click={()=>openItem("axe")}>Machado Insane</span></div>
                <div class="slots"><img id="colete_img" src="/images/colete.png" alt="colete" on:click={() => openItem("vest") }></div>
                <div class="slots"><span on:click={()=>openItem("ndf1")}>item errado</span></div>
                <div class="slots">item errado</div>
                <div class="slots"><span style="cursor: pointer;">Bota</span></div>
                <div class="slots"><img id="glove_img" src="/images/glove.png" alt="glove" on:click={() => openItem("gloves")}></div>
                <div class="slots"><span style="cursor: pointer;" on:click={()=>openItem("ndf2")}>item errado</span></div>
                <div class="slots"><span style="cursor: pointer;" on:click={()=>openItem("ndf3")}>item errado</span></div>
                <div class="slots"><span style="cursor: pointer;" on:click={()=>openItem("ndf4")}>item errado</span></div>
            </div>
        </div>

        {#each cards as card}
            <div class="card" id={card.item} style="display: none;">
                <div class="item_Name">
                    <h1>{card.item_name}</h1>
                </div>
                <div class="cardInfo">
                    <img src={card.item_image} alt={card.item_name}>
                </div>
                <div class="item_description">
                    <h1>Descrição do item</h1>
                    <p>{card.item_info}</p>
                </div>
                <div class="btnArea">
                    <div class="returnBtn" on:click={()=>{openItem(card.item)}}>Voltar</div>
                    <div class="confirmBtn" on:click={()=>{equipItem(card.item,card.img_ref)}}>Equipar</div>
                </div>
            </div>
            
        {/each}
        
        
    </div>
    
</div>
<script>
    class epiCard{
        constructor(item_name,item_info,item_image,item,img_ref){
            this.item_name = item_name
            this.item_info = item_info
            this.item_image = item_image        
            this.item = item        
            this.img_ref = img_ref
        }
    }
    class playerEpi{
        constructor(helmet,glasses,vest,glove){
            this.helmet = helmet;
            this.glasses = glasses;
            this.vest = vest;
            this.glove = glove;
        }
    }

    let points = 0

    let glove = new epiCard("Luvas de proteção","As luvas de proteção tem a capacidade de proteger a sua mão de possiveis riscos e acidentes no local de trabalho.","/images/glove.png","gloves","glove_img")
    let helmet = new epiCard("Capacete de segurança","Este item tem a capacidade de proteger a sua cabeça de possiveis riscos e acidentes de trabalho.","/images/helmet.png","helmet","helmet_img")
    let glasses = new epiCard("Oculos de proteção","Este item tem a capacidade proteger a seu olho de possiveis riscos e acidentes de trabalho.","/images/glasses.png","glasses","glasses_img")
    let vest = new epiCard("Colete refletivo","Este item vai melhorar a visibilidade de quem o usa, evitando que ele seja atingido por um veículo ou equipamento.","/images/colete.png","vest","colete_img")
    let axe = new epiCard("Machado","O machado acaba com seus problemas ;)","#","axe","#")
    let definir1 = new epiCard("Item não definido","Descrição não definida","#","ndf1","#")
    let definir2 = new epiCard("Item não definido","Descrição não definida","#","ndf2","#")
    let definir3 = new epiCard("Item não definido","Descrição não definida","#","ndf3","#") 
    let definir4 = new epiCard("Item não definido","Descrição não definida","#","ndf4","#")
    let definir5 = new epiCard("Item não definido","Descrição não definida","#","ndf5","#")
    let cards = [glove,helmet,glasses,vest,axe,definir1,definir2,definir3,definir4,definir5]
    let worker = new playerEpi(false,false,false,false)

    function openItem(el){
        let it = document.getElementById(el)
        if(it.style.display === "none"){
            it.style.display = "flex"
        }else{
            it.style.display = "none"
        }
    }

    function equipItem(el,imgRef){
        imgRef = document.getElementById(imgRef)
        let card = document.getElementById(el)
        
        card.classList.add("cardShakeAniamtion")
        setTimeout(() => {
            if(el === "helmet"){
                card.classList.add("cardOutAnimation")
                points += 5
                worker.helmet = true 
                imgRef.classList.add("hiddenAnimation")

            }else if(el === "gloves"){
                card.classList.add("cardOutAnimation")
                points += 5
                worker.glove = true
                imgRef.classList.add("hiddenAnimation")

            }else if(el === "vest"){
                card.classList.add("cardOutAnimation")
                points += 5
                worker.vest = true
                imgRef.classList.add("hiddenAnimation")

            }else if(el === "glasses"){
                card.classList.add("cardOutAnimation")
                points += 5
                worker.glasses = true
                imgRef.classList.add("hiddenAnimation")
            }else{
                points -= 5
                console.log("ta errado")
            }
            taskFInished()
            setTimeout(() => {
                card.style.display = "none"
                imgRef.style.pointerEvents = "none"  
            }, 1300);
            
        }, 1450);
    }

    function taskFInished(){
        if(worker.helmet && worker.glasses && worker.vest && worker.glove){
            console.log("Pontuação final ",points," pontos." )
            setInterval(() => {
                document.getElementById("epiContainer").style.display = "none"       
            }, 2500);
            console.log("você possui ", points, " Pontos")
        }
    }
</script>