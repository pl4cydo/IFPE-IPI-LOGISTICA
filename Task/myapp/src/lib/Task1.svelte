<svelte:head>
    <link rel="stylesheet" href="./styles/Task1.css">
</svelte:head>
<script>
    const storageBoxes = [
        {sClass: "storageBox", sData:"squareBox", sSrc: "/images/box2.png"},
        {sClass: "storageBox", sData:"squareBox", sSrc: "/images/box2.png"},
        {sClass: "storageBox", sData:"squareBox", sSrc: "/images/box2.png"},
        {sClass: "storageBox", sData:"squareBox", sSrc: "/images/box2.png"},
        {sClass: "storageBox", sData:"squareBox", sSrc: "/images/box2.png"},
        {sClass: "storageBox", sData:"squareBox", sSrc: "/images/box2.png"},
        {sClass: "storageBox", sData:"squareBox", sSrc: "/images/box2.png"},
        {sClass: "storageBox", sData:"squareBox", sSrc: "/images/box2.png"},
        {sClass: "storageBox", sData:"squareBox", sSrc: "/images/box2.png"},
        {sClass: "storageBox", sData:"rectBox", sSrc: "/images/rect80px.png"},
        {sClass: "storageBox", sData:"rectBox", sSrc: "/images/rect80px.png"},
        {sClass: "storageBox", sData:"rectBox", sSrc: "/images/rect80px.png"},
        {sClass: "storageBox", sData:"rectBox", sSrc: "/images/rect80px.png"},
        {sClass: "storageBox", sData:"rectBox", sSrc: "/images/rect80px.png"},
        {sClass: "storageBox", sData:"rectBox", sSrc: "/images/rect80px.png"}

    ]
    const areaBoxes =[
        {areaClass:"box", areaData:"squareBox", imgSrc: "/images/box2.png", imgClass:"boxImage"},
        {areaClass:"box", areaData:"squareBox", imgSrc: "/images/box2.png", imgClass:"boxImage"},
        {areaClass:"box", areaData:"squareBox", imgSrc: "/images/box2.png", imgClass:"boxImage"},
        {areaClass:"box", areaData:"squareBox", imgSrc: "/images/box2.png", imgClass:"boxImage"},
        {areaClass:"box", areaData:"squareBox", imgSrc: "/images/box2.png", imgClass:"boxImage"},
        {areaClass:"box", areaData:"squareBox", imgSrc: "/images/box2.png", imgClass:"boxImage"},
        {areaClass:"box", areaData:"squareBox", imgSrc: "/images/box2.png", imgClass:"boxImage"},
        {areaClass:"box", areaData:"squareBox", imgSrc: "/images/box2.png", imgClass:"boxImage"},
        {areaClass:"box", areaData:"squareBox", imgSrc: "/images/box2.png", imgClass:"boxImage"}
    ]
    
    let areaLock = false
    let clickLock = true
    let selectedBox
    let selectedArea

    function openStorage(){
        let storage = document.getElementById("storage")
        storage.style.visibility = "visible"
    }

    function closeStorage(){
        let storage = document.getElementById("storage")
        storage.style.visibility = "hidden"
    }

    function selectBox(){
        if(clickLock){     
            selectedBox = this
            clickLock = false
            areaLock = true
            console.log("Tipo da caixa:", selectedBox.dataset.type)       
        } 
    }

    function selectArea(){
        if(areaLock){
            selectedArea = this 
            checkMatch()
        }
    }

    function checkMatch(){
        var ImG = selectedArea.children[0]
        if(selectedArea.dataset.type === selectedBox.dataset.type){
            selectedArea.classList.add("clickLock")
            selectedBox.style.display = "none"
            ImG.style.visibility= "visible"
        }
        else{
            console.log("Caixa não correspondente")
        }
        clickLock = true
        areaLock = false
        selectedBox = null
        selectedArea = null
        ImG = null
    }
</script>
    

<div class="container">
    <div class="taskScreen">
        <img on:click={openStorage} id="Ground_box" src="/images/boxes2.png" alt="Boxes">
        <div id="taskPallet">
            <div id="palletBoxes">
                <div class="boxes">
                    {#each areaBoxes as {areaClass, areaData, imgSrc, imgClass} }
                        <div on:click={selectArea} class={areaClass} data-Type={areaData}><img class={imgClass} src={imgSrc} alt="box"></div>
                    {/each}
                </div>
                <img id="palletTask" src="./images/pallet-250px.png" alt="">
            </div>
        </div> <!--taskpallet-->>
        
        <div id="storage">
            <div on:click={closeStorage} id="closeBtn">X</div>
            <div class="storageBoxes">
                {#each storageBoxes as {sClass,sData,sSrc} }
                <div on:click={selectBox} data-Type={sData} class={sClass}><img src={sSrc} alt="box"></div>
                {/each}
            </div>
        </div> <!--storage-->
    </div>
    <img id="worker" src="./images/worker.png" alt="worker">
    <div class="dialogueBox">
    
    </div>
</div>