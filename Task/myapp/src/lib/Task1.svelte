<svelte:head>
    <link rel="stylesheet" href="./styles/Task1.css">
</svelte:head>
<script>
    let clickLocker = true
    let Box

    function openStorage(){
        let storage = document.getElementById("storage")
        storage.style.visibility = 'visible'
        console.log("aoba")
    }
    function closeStorage(){
        let storage = document.getElementById("storage")
        storage.style.visibility = "hidden"
    }
    function selectBox(){
        if(clickLocker == true){
            Box = this
            console.log(Box)
            clickLocker = false

        }
        else{
            console.log('caixa ja selecionada')
        }
        
    }
</script>
    


<div class="container">
    <div class="taskScreen">
        <img on:click={openStorage} id="Ground_box" src="/images/boxes2.png" alt="Boxes">
        <div id="taskPallet">
            
        </div>
        <div id="storage">
            <div on:click={closeStorage} id="closeBtn">X</div>
            <div class="boxContainer">
                <div on:click={selectBox} class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} class="boxCont"><img src="/images/box2.png" alt="box"></div>
                <div on:click={selectBox} class="boxCont"><img src="/images/box2.png" alt="box"></div>
            </div>
        </div>
    </div>
</div>
<div class="dialogueBox">
    <img id="worker" src="./images/worker.png" alt="worker">

</div>