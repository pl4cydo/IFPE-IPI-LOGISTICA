<script>
    import { walk } from '../stores'

    function backToLobby() {
            game.style.display = "flex"
            task2.style.display = "none"
            $walk = true
    }
</script>


<div id="task2">
        <h1>Task 2</h1>
        <button on:click={() => backToLobby()}>Back</button>
</div>

<style>
    #task2{
        width: 100vw;
        height: 100vh;
        justify-content: center;
        align-items: center;
        display: none;
    }
</style>