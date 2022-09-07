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
    
    // function animation 
	
</script>
<main>
    <img class="background" src="./images/Background.png" alt="">
    <table>
        {#each map as row, i}
        <tr>
            {#each [...row] as ch, j}
                {#if ch == '#'}
                    <img class="images" src="./images/IndustrialTile_03.png" alt="flor">
                {:else if ch != '#'}
                    <img class="images" src="./images/IndustrialTile_01.png" alt="">
                {/if}
            {/each}
        </tr>
        {/each}
    </table>
    <div class="sprite">
        <img class="hammer" src="./images/Hammer.png" alt="">
    </div>
    <div class="mario">
        <img class="mario-img" src="./images/_.png" alt="">
    </div>
</main>


<style>
    body {
        padding: 0%;
        margin: 0%;
    }
    main {
        justify-content: center;
        align-items: center;
        display: flex;
    }
    table {
        position: absolute;
    }
    .background {
        width: 100%;
		height: 100vh;
    }
	td {
		width: 50px;
		height: 50px;
	}
    tr {
        padding: 0%;
        margin: 0%;
    }
    .images {
        width: 70px;
		height: 70px;
        background: #333;
        margin-top: -5px;
        padding: 0;
        /* position: absolute; */
     } 
	.wall {
        background: #333;
	}
	table{
        position: absolute;
		margin: auto;
		transform: perspective(400px) rotateX(20deg)
	} 

    .sprite {
        width: 32px;
        height: 64px;
        position: absolute;
        /* border: 1px solid black; */
        overflow: hidden;
        margin-left: -75px;
        margin-top: -20px;
        transform: perspective(400px) rotateX(-40deg);
    }
    .hammer {
        animation: moviment 2s steps(8, end) infinite;
    }
    .mario {
        width: 50px;
        height: 64px;
        position: absolute;
        /* border: 1px solid black; */
        overflow: hidden;
        margin-left: 200px;
        margin-top: -20px;
        /* transform: perspective(400px) rotateX(-40deg); */
    }
    .mario-img {
        width: 700px;
        height: 700px;
        animation: mariopassos .4s steps(2, end) infinite;
    }
    @keyframes moviment {
        from {
            margin-left: 0px;
        }
        to {
            margin-left: -256px;
        }
    }
    @keyframes mariopassos {
        from {
            margin-left: 0px;
        }
        to {
            margin-left: -150px;
        }
    }
 </style>