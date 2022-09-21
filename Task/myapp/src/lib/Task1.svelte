<svelte:head>
    <link rel="stylesheet" href="./styles/Task1.css">
</svelte:head>
<script>
    let areaLock = false
    let clickLock = true
    let selectedBox
    let selectedArea

    

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
            clickLock = false
            areaLock = true
        }        
    }

    function selectArea(){
        selectedArea = this        
        checkMatch()
    }

    function checkMatch(){
        if(areaLock){
            var ImG = selectedArea.children[0]
            if(selectedArea.dataset.Type == selectedBox.dataset.Type){
                selectedArea.classList.add("clickLock")
                selectedBox.style.display = "none"
                ImG.style.visibility= "visible"
            }
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
                <div class="teste">
                    <div on:click={selectArea} class="bx" data-Type="squareBox"><img class="boxImage" src="/images/box2.png" alt=""></div>
                    <div on:click={selectArea} class="bx" data-Type="squareBox"><img class="boxImage" src="/images/box2.png" alt=""></div>
                    <div on:click={selectArea} class="bx" data-Type="squareBox"><img class="boxImage" src="/images/box2.png" alt=""></div>
                    <div on:click={selectArea} class="bx" data-Type="squareBox"><img class="boxImage" src="/images/box2.png" alt=""></div>
                    <div on:click={selectArea} class="bx" data-Type="squareBox"><img class="boxImage" src="/images/box2.png" alt=""></div>
                    <div on:click={selectArea} class="bx" data-Type="squareBox"><img class="boxImage" src="/images/box2.png" alt=""></div>
                    <div on:click={selectArea} class="bx" data-Type="squareBox"><img class="boxImage" src="/images/box2.png" alt=""></div>
                    <div on:click={selectArea} class="bx" data-Type="squareBox"><img class="boxImage" src="/images/box2.png" alt=""></div>
                    <div on:click={selectArea} class="bx" data-Type="squareBox"><img class="boxImage" src="/images/box2.png" alt=""></div>
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
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/rect80px.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/rect80px.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/rect80px.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/rect80px.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/rect80px.png" alt="box"></div>
                <div on:click={selectBox} data-Type="squareBox" class="boxCont"><img src="/images/rect80px.png" alt="box"></div>
            </div>
        </div> <!--storage-->
    </div>
    <img id="worker" src="./images/worker.png" alt="worker">
    <div class="dialogueBox">
    
    </div>
</div>