<script>
    import { onMount } from "svelte";

    const a = 'haku';

    //variavel declarada como array para receber o jason tratado
    let leitor = [];

    async function loadRanking(){
        let resposta = await fetch('http://localhost:8001/leitor.php');
        // console.log(resposta)
        let texto = await resposta.text();
        // console.log(texto)
        let json = JSON.parse(texto);
        // console.log(json)
        leitor = [...json];
    }

   

    onMount(async () => {
        await loadRanking();
        await console.log(leitor)
    });

    
</script>


<h1>{a}</h1>
{#each leitor as leito }
    <li>{leito}</li>
{/each}

<style>
</style>