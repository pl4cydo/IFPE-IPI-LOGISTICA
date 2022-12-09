<script>
    import { onMount } from "svelte";
    import { ranking } from "../stores";
  
    const a = 'Ranking';
  
    //variavel declarada como array para receber o jason tratado
    let leitor = [];
  
    async function loadRanking(){
        let resposta = await fetch('http://localhost:8001/ler_banco.php');
        let texto = await resposta.text();
        let json = JSON.parse(texto);
        leitor = json;
        // console.log(leitor)
    }
  
    // const form = {
    //     nome: "",
    //     pontos: 0,
    // };

    // const addranking = () => {
    //     //   console.log(form.nome, form.pontos)
    //     form.nome = 'Pchronos';
    //     form.pontos = 7000;

    //     $ranking = $ranking.concat({
    //         nome: form.nome,
    //         pontos: form.pontos
    //     })
    //     //   console.log($ranking)
    // }
  
    onMount(async () => {
      await loadRanking();
    });
  </script>
  <body>
    <div id="tela">
        <h1>{a}</h1>
        <!-- <form on:submit|preventDefault={addranking}>
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
        </form> -->
        <!-- <button on:click={() => addranking()}>Mandar</button> -->
        {#each leitor as el, i }
            {#if i < 10}
                <ul>{(i+1) + "º"}  {el.Nome}  {el.pontos}</ul>
            {/if}
        {/each}
      </div>
  </body>
  
  <style>
    body{
        width: 100vw;
        height: 100vh;
        justify-content: center;
        align-items: center;
        display: flex;
        background-color: gray;
        margin: 0;
        padding: 0;
    }

    #tela{
        width: 1080px;
        height: 720px;
        justify-content: center;
        align-items: center;
        display: grid;  
        border: 1px solid black
    }
  </style>