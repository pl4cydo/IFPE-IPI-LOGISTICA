<script>
    import { walk } from '../stores'
    import { ranking } from '../stores'

    function backToLobby() {
            game.style.display = "flex"
            task2.style.display = "none"
            $walk = true
    }

    const form = {
        nome: "",
        pontos: 0,
    };

    const addranking = () => {
        // form.nome = 'Pchronos';
        // form.pontos = 7000;

        $ranking = $ranking.concat({
            nome: form.nome,
            pontos: form.pontos
        })
    }


</script>


<div id="task2">
        <h1>Task 2</h1>
        <button on:click={() => backToLobby()}>Back</button>

        <form on:submit|preventDefault={addranking}>
            <input 
                type="text" 
                placeholder="Nome" 
                name="Nome" 
                bind:value={form.nome}
            />
            <input 
                type="number" 
                placeholder="pontos" 
                name="pontos" 
                bind:value={form.pontos}
            /> 
            <button>Send</button>
        </form>
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