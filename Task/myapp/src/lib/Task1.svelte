<script>

</script>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@1,300&family=Press+Start+2P&family=Roboto&display=swap');
    .container{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;
        background-color: gray;
    }
    .taskScreen{
        position: absolute;
        background: #e0d479;
        width: 80%;
        height: 80%;
        border: solid 2px black;
    }
    .dialogueBox{
        padding: 10px;
        bottom: 0;
        width: 100%;
        height: 150px;
        border-top:2px solid black;
        background-color: #dc0e0e ;
        position: absolute;
    }
    #worker{
        position: absolute;
        max-width: 250px;
        bottom: 120px;
        right: 0;

    }
    .dialogueBox > p{
        position: absolute;
        color: white;
        font-size: 16pt;
        font-family: 'Press Start 2P', cursive;
    }
</style>

<div class="container">
    <div class="taskScreen">
        <img id="worker" src="./images/worker.png" alt="worker">
        <div class="dialogueBox">

            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium libero corrupti, deserunt a ipsum assumenda voluptatum veritatis, sint omnis ratione explicabo! Laborum exercitationem amet tenetur dolorem incidunt doloribus dolor explicabo!</p>

        </div>

    </div>
</div>