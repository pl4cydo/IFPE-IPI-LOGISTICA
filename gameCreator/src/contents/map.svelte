<script>
	let name = 'teste';
	let map = [
		'##########',
		'######0###',
		'######0###',
		'######0###',
		'###0######',
		'###0######',
		'###0######',
	];
    
	
</script>

<table>
	{#each map as row, i}
	<tr>
		{#each [...row] as ch, j}
            {#if ch == '#'}
                <img src="./images/IndustrialTile_03.png" alt="flor">
            {:else if ch != '#'}
                <img src="./images/IndustrialTile_01.png" alt="">
            {/if}
		{/each}
	</tr>
	{/each}
</table>

<style>
	td {
		width: 50px;
		height: 50px;
	}
    img {
        width: 50px;
		height: 50px;
        background: #333;
        margin-top: 0;
        padding: 0;
    }
	.wall {
        background: #333;
	}
	table{
        padding: 0;
		margin: auto;
		transform: perspective(400px) rotateX(30deg)
	}
 </style>