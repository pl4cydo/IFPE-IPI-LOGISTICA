<script>
  import FirstMap from './mapa1/firstMap.svelte';
  import { estado } from './Estado';
  // import TelaTeste from './telaTeste/telaTeste.svelte';
  import TelaTeste from './telaTeste/telaTeste.svelte'
  import TelaTeste1 from './telaTeste/telaTeste1.svelte'
  import TelaTeste2 from './telaTeste/telaTeste2.svelte'
  let a = 'Beta2.0'
</script>

<main>
  <h1>{a}</h1>
  {#if $estado === 'mapa'}
    <FirstMap/>
  {:else if $estado === 'telaTeste'}
      <TelaTeste/>
  {:else if $estado === 'telaTeste1'}
      <TelaTeste1/>
  {:else if $estado === 'telaTeste2'}
      <TelaTeste2/>
  {/if}
</main>
<style>
   h1{
      position: absolute;
    }
</style>
