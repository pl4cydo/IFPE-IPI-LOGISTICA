<script>
	import { onMount } from 'svelte';
	
	let canvas;
	
	onMount(() => {
        canvas.width = 1024;
        canvas.height = 576;
		const ctx = canvas.getContext('2d');
		
		ctx.fillStyle = 'white';
		ctx.fillRect(0,0,canvas.width, canvas.height);

        const image = new Image();
        image.src= './images/MapaAlpha2.png'    

        const player = new Image();
        player.width = '300px'
        player.height = '300px'
        player.src = './images/engineer-idle.png'

        image.onload = () => {
            ctx.drawImage(image, canvas.width/8, canvas.height/8)
            ctx.drawImage(
                player,
                canvas.width/2 - player.width/2,
                canvas.height/2
                )
        }

	})
	

</script>
<main>
    <body>
        <canvas bind:this={canvas} id="desenho"></canvas>

    </body>
</main>

<style>
	body {
		/* display: flex;
        flex-direction: row;
		justify-content: center;
		align-items: center; */
		
	}
	canvas {
        /* position: absolute;  */
		border: 1px solid black;
		/* transform: perspective(400px) rotateX(20deg); */
	}
</style>