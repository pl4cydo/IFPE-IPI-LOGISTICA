<script>
    import { walk } from '../stores'
    import { ranking } from '../stores'
    import { Nome } from '../stores'
    import { totalPoints } from '../stores'

    function backToLobby() {
            game.style.display = "flex"
            task2.style.display = "none"
            $walk = true
    }

    const form = {
        nome: "",
        pontos: 0
    };

    const addranking = () => {
        form.nome = $Nome;
        form.pontos = $totalPoints;
        $ranking = $ranking.concat({
            nome: form.nome,
            pontos: form.pontos
        })
    }


</script>


<div id="task2">
        <h1>Task 2</h1>
        <button on:click={() => backToLobby()}>Back</button>
        <p>{$Nome}</p>
        <p>{$totalPoints}</p>
        <button on:click={() => addranking()}>Teste</button>
        <!-- <form on:submit|preventDefault={addranking}>
            <input 
                type="text" 
                placeholder="Nome" 
                name="Nome" 
                bind:value={form.nome}
            />
            <button>Send</button>
        </form> -->
</div>


<style>
    #task2{
        position: absolute;
        width: 40%;
        height: 40%;
        justify-content: center;
        align-items: center;
        display: none;
    }
</style>