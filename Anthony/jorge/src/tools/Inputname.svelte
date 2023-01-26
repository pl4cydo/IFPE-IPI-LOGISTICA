<script>
    import { trocarEstadoDoJogo } from "../Estado";
    import { Nome } from "../stores";
</script>

<div class="input-content flex-align-center">
    <div class="text-wrapper flex-align-center">
        <p>Antes de iniciar o jogo digite seu nome abaixo.</p>
    </div>
    <div class="input-wrapper">
        <input id="name-input" type="text" placeholder="Digite seu nome" name="Nome" maxlength="24" bind:value={$Nome} />
        <div id="input-btn" on:click={() => trocarEstadoDoJogo("game")}>Enviar</div>
    </div>
</div>
<style>
    *{
        padding: 0;
        margin: 0;
        box-sizing: border-box;
    }

    .input-content{
        flex-flow: column nowrap;
        /* background: rgb(0, 0, 0); */
        width: 50%;
        height: 70%;
        border-radius: 10px;
        /* box-shadow: 2px 5px 8px rgb(128, 128, 128); */
    }
    .text-wrapper{
        width: 100%;
        color: black;
        font-size: 1.2em;   
    }

    #name-input{
        background: rgb(223, 223, 223);
        padding: 5px;
        width: 75%;
        border: none;
        border-radius: 5px 0 0 5px;
        outline: none;
    }
    #name-input::placeholder{
        font-size: 1em;
    }
    .input-wrapper{
        position: relative;
        display: flex;
        width: 100%;
        padding: 5%;
    }
    #input-btn{
        text-align: center;
        width: 25%;
        padding: 2%;
        cursor: pointer;
        color: aliceblue;
        border-radius: 0px 5px 5px 0;
        background: dodgerblue;
    }
    .flex-align-center{
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
