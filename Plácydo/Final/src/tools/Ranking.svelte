<script>
    import { onMount } from "svelte";
    import { trocarEstadoDoJogo } from "../Estado";
    let leitor = [];
    async function loadRanking() {
        let resposta = await fetch("http://localhost:8001/ler_banco.php");
        let texto = await resposta.text();
        let json = JSON.parse(texto);
        leitor = json;
    }
    onMount(async () => {
        await loadRanking();
    });
</script>

<div class="rankingarea flex-align-center">
    <div class="voltar" on:click={() => trocarEstadoDoJogo("menu")}>Voltar</div>
    <div class="tabela-de-ranking">
        <div class="ranking-tittle">
            <h1>RANKING</h1>
        </div>
        <div class="players">
            {#each leitor as el, i}
                {#if i < 10}
                <div
                    class="player"
                    class:first={i == 0}
                    class:second={i == 1}
                    class:third={i == 2}
                >
                    {#if i < 10}
                        <div class="p-position flex-align-center">
                            <h2>{i + 1 + "º"}</h2>
                        </div>
                        <div class="p-name flex-align-center">{el.Nome}</div>
                        <div class="p-points flex-align-center">
                            {el.pontos}
                        </div>
                    {/if}
                </div>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style>
    .voltar{
        position: absolute;
        top: 10%;
        right: 0;
    }
    .rankingarea {
        width: 80%;
        height: 90%;
        font-family: "VT323";
        margin-top: 30%;
        /* background-color: blue; */
    }
    .tabela-de-ranking {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .ranking-tittle {
        text-align: center;
        color: black;
        text-shadow: black 1px 0 1px;
        font-size: 2em;
        letter-spacing: 2px;
    }
    .players {
        padding: 5%;
        display: flex;
        flex-flow: column nowrap;
    }
    .player {
        background: #dfdedeca;
        padding: 5px;
        border-bottom: 1px solid #888888;
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
        margin-bottom: 3%;
        box-shadow: black 2px 2px 2px;
    }
    .p-name,
    .p-points,
    .p-position {
        width: 30%;
        color: black;
        font-weight: 700;
    }

    .p-name {
        font-size: 1.2em;
    }
    .first {
        background: rgba(255, 217, 0, 0.7);
    }
    .second {
        background: rgba(192, 192, 192, 0.8);
    }
    .third {
        background: rgba(255, 127, 80, 0.7);
    }
    .flex-align-center {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    </style>