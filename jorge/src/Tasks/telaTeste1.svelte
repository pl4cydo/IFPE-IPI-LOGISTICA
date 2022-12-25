<script>
    import { walk } from '../stores'

    function backToLobby() {
            game.style.display = "flex"
            task1.style.display = "none"
            $walk = true
    }
</script>


<div id="task1">
        <h1>Task 1</h1>
        <button on:click={() => backToLobby()}>Back</button>
</div>

<style>
    #task1{
        width: 100vw;
        height: 100vh;
        justify-content: center;
        align-items: center;
        display: none;
    }
</style>