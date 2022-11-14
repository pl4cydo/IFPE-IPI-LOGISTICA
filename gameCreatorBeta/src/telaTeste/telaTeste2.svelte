<script>
    import { trocarEstadoDoJogo } from '../Estado';

</script>

<main>
    <div id="principal">
        <h1>Task 2</h1>
        <button on:click={() => trocarEstadoDoJogo('mapa')}>Back</button>
    </div>
</main>

<style>
    #principal{
        width: 100vw;
        height: 100vh;
        justify-content: center;
        align-items: center;
        display: flex;
    }
</style>