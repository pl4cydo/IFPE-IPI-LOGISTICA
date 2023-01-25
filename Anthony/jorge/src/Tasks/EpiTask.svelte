<svelte:head>
    <link rel="stylesheet" href="/styles/epi.css">
</svelte:head>
<script>
    import { taskOrder, walk } from "../stores";
    import { infoTasks0 } from "../stores";
    import { totalPoints } from "../stores";
    import { Nome } from "../stores"

    class EpiCard{
        constructor(item_name,item_info,item_image,item,img_ref){
            this.item_name = item_name
            this.item_info = item_info
            this.item_image = item_image        
            this.item = item        
            this.img_ref = img_ref
        }
    }
    class PlayerEpi{
        constructor(helmet,glasses,vest,glove,boot,headphone){
            this.helmet = helmet;
            this.glasses = glasses;
            this.vest = vest;
            this.glove = glove;
            this.boot = boot
            this.headphone = headphone
        }
    }

    let pointsEpi = 0
    let equipedItem = ""
    let equipCont = 6
    let confirmlock = true

    let glove = new EpiCard("Luvas de proteção","As luvas de proteção tem a capacidade de proteger a sua mão de possiveis riscos e acidentes no local de trabalho.","/images/glove.png","gloves","glove_img")
    let helmet = new EpiCard("Capacete de segurança","Este item tem a capacidade de proteger a sua cabeça de possiveis riscos e acidentes de trabalho.","/images/helmet.png","helmet","helmet_img")
    let glasses = new EpiCard("Oculos de proteção","Este item tem a capacidade proteger a seu olho de possiveis riscos e acidentes de trabalho.","/images/glasses.png","glasses","glasses_img")
    let vest = new EpiCard("Colete refletivo","Este item melhora a visibilidade de quem o usa, evitando que ele seja atingido por um veículo ou equipamento.","/images/colete.png","vest","colete_img")
    let axe = new EpiCard("Machado","O machado acaba com seus problemas ;)","/images/machado.png","axe","machado_img")
    let boot = new EpiCard("Botas com biqueira","Descrição não definida","/images/BotaEpii.png","boot","boot_img")
    let protetor = new EpiCard("Protetor de ouvido","Descrição não definida","/images/Protetor.png","headphones","protetor_img")
    let desentupidor = new EpiCard("desentupidor","Descrição não definida","/images/Desentupidor.png","desentupidor","desentupidor_img") 
    let helmet2 = new EpiCard("Capacete danificado","Descrição não definida","/images/capacetedanificado.png","helmet2","helmet2_img")
    let boot2 = new EpiCard("Bota Balence iada","Bota balanciada... ","/images/botabalanceiada.png","boot2","boot2_img")
    let cards = [glove,helmet,glasses,vest,axe,boot,protetor,desentupidor,helmet2,boot2]
    let worker = new PlayerEpi(false,false,false,false,false,false)

    function openItem(el){
        let it = document.getElementById(el)
        if(it.style.display === "none"){
            it.style.display = "flex"
        }else{
            it.style.display = "none"
        }
    }

    function equipItem(el,imgRef){
        let card = document.getElementById(el)
        imgRef = document.getElementById(imgRef)
        if(confirmlock){
            confirmlock = false
            card.classList.add("cardShakeAniamtion")
            setTimeout(() => {
                if(el === "helmet"){
                    card.classList.add("cardOutAnimation")
                    pointsEpi += 25
                worker.helmet = true 
                imgRef.classList.add("hiddenAnimation")
                equipedItem = "Capacete de segurança equipado "
                equipCont --
                setTimeout(() => {
                    openItem("dialogueContainer")    
                }, 800); 

            }else if(el === "gloves"){
                card.classList.add("cardOutAnimation")
                pointsEpi += 25
                worker.glove = true
                imgRef.classList.add("hiddenAnimation")
                equipedItem = "Luvas de segurança equipadas "
                equipCont --
                setTimeout(() => {
                    openItem("dialogueContainer")    
                }, 800); 
            }else if(el === "vest"){
                card.classList.add("cardOutAnimation")
                pointsEpi += 25
                worker.vest = true
                imgRef.classList.add("hiddenAnimation")
                equipedItem = "Colete refletivo equipado "
                equipCont --
                setTimeout(() => {
                    openItem("dialogueContainer")    
                }, 800); 
            }else if(el === "glasses"){
                card.classList.add("cardOutAnimation")
                pointsEpi += 25
                worker.glasses = true
                imgRef.classList.add("hiddenAnimation")
                equipedItem = "Óculos de proteção equipado "
                equipCont --
                setTimeout(() => {
                    openItem("dialogueContainer")    
                }, 800); 
            }
            else if(el === "boot"){
                card.classList.add("cardOutAnimation")
                pointsEpi += 25
                worker.boot = true
                imgRef.classList.add("hiddenAnimation")
                equipedItem = "Botas equipadas "
                equipCont --
                setTimeout(() => {
                    openItem("dialogueContainer")    
                }, 800);     
            }
            else if(el === "headphones" ){
                card.classList.add("cardOutAnimation")
                pointsEpi += 25
                worker.headphone = true
                imgRef.classList.add("hiddenAnimation")
                equipCont --
                equipedItem = "Protetor de ouvido equipado "   
                setTimeout(() => {
                    openItem("dialogueContainer")    
                }, 800); 
            }
            else{
                pointsEpi -= 10
                changeDialogues("dialogue-5","dialogue-6")
                setTimeout(() => {
                    openItem("dialogueContainer")
                    
                }, 1400); 
            }
                setTimeout(() => {
                    card.style.display = "none"
                    imgRef.classList.add("hiddenAnimation")
                    imgRef.style.pointerEvents = "none"  
                    }, 1300);
            
                setTimeout(()=>{
                    openItem("cardHolder")
                    confirmlock = true
                },1350)
            }, 1450);
        }
    }

    function changeDialogues(paragraph1,paragraph2){
        let paragraph = document.getElementById(paragraph1)

        if(paragraph.style.display ==="flex"){
            openItem(paragraph1)
            openItem(paragraph2)
        }
    }
    function taskFInished(){
        if(worker.helmet && worker.glasses && worker.vest && worker.glove && worker.boot && worker.headphone){
            openItem("EndScreen")
            openItem("epiStorage")
        }
        
    }
    function backToLobbyEpi() {
        $totalPoints += pointsEpi;
        $walk = true;
        game.style.display = "flex";
        epiScreen.style.display = "none";
        $infoTasks0 = "COMPLETO!";
        $taskOrder.t0 = false;
        $taskOrder.t1 = true;
    }
</script>

<div id="epiContainer">
    <div id="epiScreen">
        <div id="locker" on:click={()=>{openItem("epiStorage"),openItem("dialogueContainer")}}></div>
        <div id="epiStorage" style="display: none;">
            <h1>INVENTARIO DO ARMARIO</h1>
            <div id="itens">
                <div class="slots"><img id="helmet_img" src="/images/helmet.png" alt="helmet" on:click={() => {openItem("helmet"),openItem("cardHolder")}} ></div>
                <div class="slots"><img id="boot2_img" on:click={()=>{openItem("boot2"),openItem("cardHolder")}} src="/images/botabalanceiada.png" alt="bota"></div>
                <div class="slots"></div>
                <div class="slots"></div>
                <div class="slots"><img id="glasses_img" src="/images/glasses.png" alt="glasses" on:click={() => {openItem("glasses"),openItem("cardHolder")}}></div>
                <div class="slots"></div>
                <div class="slots"></div>
                <div class="slots"><img id="machado_img" on:click={()=>{openItem("axe"),openItem("cardHolder")}} src="/images/machado.png" alt="machado"></div>
                <div class="slots"><img id="colete_img" src="/images/colete.png" alt="colete" on:click={() => {openItem("vest"),openItem("cardHolder")}}></div>
                <div class="slots"><img id="helmet2_img" on:click={()=>{openItem("helmet2"),openItem("cardHolder")}} src="/images/capacetedanificado.png" alt=""></div>
                <div class="slots"> </div>
                <div class="slots"><img id="boot_img" src="/images/BotaEpii.png" alt="bota de segurança" on:click={()=>{openItem("boot"),openItem("cardHolder")}}></div>
                <div class="slots"><img id="glove_img" src="/images/glove.png" alt="glove" on:click={() => {openItem("gloves"),openItem("cardHolder")}}></div>
                <div class="slots"><img id="protetor_img" on:click={()=>{openItem("headphones"),openItem("cardHolder")}} src="/images/Protetor.png" alt=""></div>
                <div class="slots"><img id="desentupidor_img" on:click={()=>{openItem("desentupidor"),openItem("cardHolder")}} src="/images/Desentupidor.png" alt="desentupidor" ></div>
                <div class="slots"></div>
            </div>
        </div>
        <div id="dialogueContainer">
            <div style="display:flex;"  class="dialogue" id="dialogue-1">
                <p>Óla {$Nome} em nossa empresa é extremamente importante garantir a sua segurança enquando atua em nossas dependências.</p>
                <div class="skipBtn" on:click={()=> changeDialogues("dialogue-1","dialogue-2")}>Avançar</div>
            </div>
            <div style="display:none;" class="dialogue" id="dialogue-2">
                <p>Tendo isso em mente nós disponibilizamos os equipamentos de proteção essenciais para a realização segura do seu trabalho, assim que estiver pronto clique no armário para iniciar a missão. </p>
                <div class="skipBtn" on:click={()=>{openItem("dialogueContainer"),changeDialogues("dialogue-2","dialogue-3")}}>Estou pronto</div>
            </div>
            <div style="display:none; flex-direction:column;" class="dialogue" id="dialogue-3">
                <p>Para que você possa trabalhar com segurança é necessário ter equipado os seguintes equipamentos.</p>
                <div class="Epis">
                    <div>
                        <span class="unequipped">Capacete de segurança</span><span class="unequipped">Óculos de proteção</span>
                    </div>
                    <div>
                        <span class="unequipped">Colete Refletivo</span><span class="unequipped">Protetor de ouvidos</span>
                    </div>
                    <div>
                        <span class="unequipped">Botas com biqueira</span><span class="unequipped">Luvas de proteção</span>
                    </div>
                </div>
                <div class="skipBtn" on:click={()=>{changeDialogues("dialogue-3","dialogue-4")}}>Avançar</div>
            </div>
            <div style="display:none;" class="dialogue" id="dialogue-4">
                <p>Agora que você sabe quais os itens necessários selecione os equipamentos corretos para avançar para a proxima fase</p>
                <div class="skipBtn" on:click={()=>{openItem("dialogueContainer"),changeDialogues("dialogue-4","dialogue-5")}}>Selecionar itens</div>
            </div>
            <div style="display:none; flex-direction:column;" class="dialogue" id="dialogue-5">
                <p>{equipedItem} com Sucesso. <br>Equipamentos restantes: {equipCont}</p>
                <div class="Epis">
                    <div>
                        <span class:unequipped={worker.helmet == false} class:equipped={worker.helmet == true}>Capacete de segurança</span><span class:unequipped={worker.glasses == false} class:equipped={worker.glasses == true}>Óculos de proteção</span>
                    </div>
                    <div>
                        <span class:unequipped={worker.vest == false} class:equipped={worker.vest == true}>Colete Refletivo</span><span class:unequipped={worker.headphone == false} class:equipped={worker.headphone == true}>Protetor de ouvidos</span>
                    </div>
                    <div>
                        <span class:unequipped={worker.boot == false} class:equipped={worker.boot == true}>Botas com biqueira</span><span class:unequipped={worker.glove == false} class:equipped={worker.glove == true}>Luvas de proteção</span>
                    </div>
                </div>
                <div class="skipBtn" on:click={()=>{openItem("dialogueContainer"),taskFInished()}}>Continuar</div>
            </div>
            <div style="display:none; flex-direction:column;" class="dialogue" id="dialogue-6">
                <p>Este item não corresponde com os requesitos de segurança selecione outro item. </p>
                <div class="Epis">
                    <div>
                        <span class:unequipped={worker.helmet == false} class:equipped={worker.helmet == true}>Capacete de segurança</span><span class:unequipped={worker.glasses == false} class:equipped={worker.glasses == true}>Óculos de proteção</span>
                    </div>
                    <div>
                        <span class:unequipped={worker.vest == false} class:equipped={worker.vest == true}>Colete Refletivo</span><span class:unequipped={worker.headphone == false} class:equipped={worker.headphone == true}>Protetor de ouvidos</span>
                    </div>
                    <div>
                        <span class:unequipped={worker.boot == false} class:equipped={worker.boot == true}>Botas com biqueira</span><span class:unequipped={worker.glove == false} class:equipped={worker.glove == true}>Luvas de proteção</span>
                    </div>
                </div>
                <div class="skipBtn" on:click={()=>{openItem("dialogueContainer"),changeDialogues("dialogue-6","dialogue-5")}}>Continuar selecionando</div>
            </div>
        </div>
        <div id="cardHolder" style="display:none;">

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
                    <div class="returnBtn" on:click={()=>{openItem(card.item),openItem("cardHolder")}}>Voltar</div>
                    <div class="confirmBtn" on:click={()=>{equipItem(card.item,card.img_ref)}}>Equipar</div>
                </div>
            </div>
            {/each}
        </div>
        <div id="cardHolder" style="display: none;"></div>
        <div id="EndScreen" style="display: none;">
            <h1>Missão Concluida</h1>
            <h2>Pontuação da missão: {pointsEpi}</h2>
            <div id="backToMap" on:click={backToLobbyEpi}>Voltar ao mapa</div>
        </div>
    </div>
</div>

