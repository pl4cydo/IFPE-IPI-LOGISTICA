<script>

</script>
<div id="boxPlay">
    <h1>COMO JOGAR</h1>
    <p>Use teclas W A S D para mover o personagem pelo mapa</p>
    <img id="imgs" class="wasd" src="./images/wasd.png" alt="wasd">
    <p>Use a tecla de ESPAÇO para interagir com as tasks</p>
    <img id="imgs" src="./images/espaco.png" alt="espaco">
    <p>Use o MOUSE para interagir com a caixa de mensagens e para resolver as tasks</p>
    <img id="cursor" src="./images/cursor.png" alt="">
</div>

<style>
    #boxPlay{
        width: 90%;
        height: 88%;
        font-family: "VT323";
        /* border: 1px solid black; */
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        font-size: 1.5em;
        letter-spacing: 1px;
    }
    h1{
        margin-bottom: 10px;
    }
    #imgs {
        width: 70%;
        margin: 10px;
    }
    #cursor{
        width: 30%;
        margin: 10px;
    }
    .wasd{
        margin-left: -5%;
    }
    @media (max-width: 1278px) {
        #boxPlay {
            display: none;
        }
    }
</style>