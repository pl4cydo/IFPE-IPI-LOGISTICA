<script>
    
</script>

<div id="dangerBox">
    <img src="./images/faixaPerigo.png" alt="faixaPerigo">
    <h1>Perigo - Mantenha-se na faixa de movimentação em amarelo</h1>
</div>

<style>
    #dangerBox{
        width: 100%;
        height: 15%;
        border: 5px solid black;
        border-radius: 5%;
        position: relative;
        display: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
        justify-content: center;
        align-items: center;
        opacity: 0.8;
        transition: 1s ease;
        animation: piscapisca infinite 1.6s ease;
    }
    #dangerBox > img{
        height: 700%;
        width: 150%;
        position: relative;
    }
    #dangerBox > h1 {
        color: #f2f2f2;
        position: absolute;
        text-shadow: black 0.1em 0.1em 0.2em
    }
    @keyframes piscapisca{
        0%{opacity: 100%;}
        50%{opacity: 0%;}
        100%{opacity: 100%;}
    }
</style>