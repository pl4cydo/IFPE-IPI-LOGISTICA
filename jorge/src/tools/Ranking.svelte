<script>
    import { onMount } from "svelte";
    // import { ranking } from "../stores";
    //variavel declarada como array para receber o json tratado
    let leitor = [];
  
    async function loadRanking(){
        let resposta = await fetch('http://localhost:8001/ler_banco.php');
        let texto = await resposta.text();
        let json = JSON.parse(texto);
        leitor = json;
        // console.log(leitor)
    }
    onMount(async () => {
      await loadRanking();
    });
  </script>
  <body>
    <div id="tela">
        <div class="titulo"><h1>Ranking</h1></div>
        <div class="c">
            <table>
                    <tr>
                        <td>Colocação</td>
                        <td>Nome</td>
                        <td>Pontos</td>
                    </tr>
                {#each leitor as el, i }
                    <tr>
                        {#if i < 10}
                        <td>{(i+1) + "º"} </td>
                        <td>{el.Nome}</td>
                        <td>{el.pontos}</td>
                        {/if}
                    </tr>
                {/each}
            </table>
        </div>
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
        display: flex;  
        border: 1px solid black;
        position: absolute;
    }

    .titulo{
        justify-content: center;
        align-items: center;
        display: flex; 
        border: 1pt solid black;
        position: absolute;
        width: 50%;
        height: 20%;
        top: 5%
    }

    .c {
        justify-content: center;
        align-items: center;
        display: flex; 
        border: 1pt solid black;
        position: absolute;
        width: 50%;
        height: 65%;
        bottom: 5%;
    }
    table{
        height: 100%;
        width: 70%;
        border: 1pt solid black;
    }
    td {
        border: 1pt solid black;
        justify-content: center;
        align-items: center;
    }
  </style>