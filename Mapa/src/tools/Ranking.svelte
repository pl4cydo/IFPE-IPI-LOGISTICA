<script>
    import { onMount } from "svelte";
    import { ranking } from "../stores";
  
    const a = 'haku';
  
    //variavel declarada como array para receber o jason tratado
    let leitor = [];
  
    async function loadRanking(){
        let resposta = await fetch('http://localhost:8001/ler_banco.php');
        let texto = await resposta.text();
        let json = JSON.parse(texto);
        leitor = json;
        console.log(leitor)
    }
  
    const form = {
      nome: "",
      pontos: "",
    };
  
    const addranking = () => {
          console.log(form.nome, form.pontos)
          $ranking = $ranking.concat({
              nome: form.nome,
              pontos: form.pontos
          })
          console.log($ranking)
    }
  
    onMount(async () => {
      await loadRanking();
    });
  
    
  </script>
  
  
  <h1>{a}</h1>
  
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
      <button>Mandar</button>
  </form>
  
  {#each leitor as el, i }
      {#if i < 10}
          <ul>{(i+1) + "º"}  {el.Nome}  {el.pontos}</ul>
      {/if}
  {/each}
  
  <style>
  
  </style>