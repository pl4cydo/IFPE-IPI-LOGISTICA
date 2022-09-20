<svelte:head>
    <link rel="stylesheet" href="./styles/Task1.css">
</svelte:head>
<script>
    let clickLock = true
    let selectedBox
    let palletArea
    

    function openStorage(){
        let storage = document.getElementById("storage")
        storage.style.visibility = 'visible'
    }

    function closeStorage(){
        let storage = document.getElementById("storage")
        storage.style.visibility = "hidden"
    }

    function selectBox(){
        if(clickLock == true){
            selectedBox = this
            console.log(selectedBox)
            clickLock = false

        }
        else{
            console.log('caixa ja selecionada')
        }
        
    }
    function checkMatch(){
        palletArea = this

        if(palletArea.dataset.Type == selectedBox.dataset.Type){
            palletArea.style.backgroundImage = "url(/images/box2.png)";
            palletArea = null
            selectedBox = null
        }
        console.log(palletArea)
        console.log(selectedBox)
    }
</script>
    


<div class="container">
    <div class="taskScreen">
        <img on:click={openStorage} id="Ground_box" src="/images/boxes2.png" alt="Boxes">
        <div id="taskPallet">
            
            <div id="palletBoxes">
                <div id="layer1">
                    <div on:click={checkMatch} class="bx" data-Type="squareBox"></div>
                    <div on:click={checkMatch} class="bx" data-Type="squareBox"></div>
                    <div on:click={checkMatch} class="bx" data-Type="squareBox"></div>
                </div>
                <div id="layer2">
                    <div on:click={checkMatch} class="bx" data-Type="squareBox"></div>
                    <div on:click={checkMatch} class="bx" data-Type="squareBox"></div>
                    <div on:click={checkMatch} class="bx" data-Type="squareBox"></div>
                </div>
                <div id="layer3">
                    <div on:click={checkMatch} class="bx" data-Type="squareBox"></div>
                    <div on:click={checkMatch} class="bx" data-Type="squareBox"></div>
                    <div on:click={checkMatch} class="bx" data-Type="squareBox"></div>
                </div>
                <img id="palletTask" src="./images/pallet-250px.png" alt="">

            </div>
        </div> <!--taskpallet-->>
        
        <div id="storage">
            <div on:click={closeStorage} id="closeBtn">X</div>
            <div class="boxContainer">
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/box2.png" alt="box"></div>
            </div>
        </div> <!--storage-->
    </div>
    <img id="worker" src="./images/workerr.png" alt="worker">
    <div class="dialogueBox">
    
    </div>
</div>