<script>
    // TO DO: resolver movimentaçaõ com capslock

	import { onMount } from 'svelte'; // importando a função onMount da biblioteca do svelte para poder usar o canvas
   
	let canvas; // declarando uma variavel para o canvas
	
    const collisionsMap = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 5, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 5, 5, 5, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

	onMount(() => { // chamando a função onde o canvas vai ser posto
        canvas.width = 1024; // tamanho da largura do canvas
        canvas.height = 720; // tamanho da altura do canvas
		const c = canvas.getContext('2d'); // criando uma variavel e chamando o canvas para declarar o contexto 2D

        const imageMap = new Image();
        imageMap.src= './images/mini-mapa.png' 
        const imagePlayer = new Image(); 
        imagePlayer.src = './images/redSprite.png'

        const boundariesObjets = [];

        const offset = {
            x: -635,
            y: -370
        }

        let lastKey = ''

        class Sprite { 
            constructor({position,velocity, image, frames = {max: 1}}){
                this.position = position;
                this.image = image;
                this.frames = frames;

                this.image.onload = () => {
                    this.width = this.image.width / this.frames.max
                    this.height = this.image.height / this.frames.max
                    // console.log(this.width);
                    // console.log(this.height);
                }
            }

            draw(){
             c.drawImage(
                this.image,
                0, 
                0, 
                this.image.width / this.frames.max, 
                this.image.height / this.frames.max,
                this.position.x,
                this.position.y,
                this.image.width / this.frames.max,
                this.image.height / this.frames.max, 
                )
            }
        }

        class Boundary {
            constructor({position}){
                this.position = position;
                this.width = 38.4;
                this.height = 38.4;
            }
            draw(){
             c.fillStyle = 'red'
             c.fillRect(this.position.x, this.position.y, this.width, this.height)
            }
        }

        collisionsMap.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if(symbol == 5){
                    boundariesObjets.push(
                        new Boundary({
                            position: {
                                x: j * 38.4 + offset.x,
                                y: i * 38.4 + offset.y
                            }
                        })
                    )
                }
            })
        })

        // console.log(boundariesObjets)

        const player = new Sprite({
            position: {
                x: canvas.width/2 - 256/4,
                y: canvas.height/2 - 256/4
            },
            image: imagePlayer,
            frames: {
                max: 4
            }

        })

        const background = new Sprite({ 
            position: {
                x: offset.x,
                y: offset.y
            }, 
            image: imageMap
        })

        // const testBoundary = new Boundary({
        //     position: {
        //         x: 517,
        //         y: 250
        //     }
        // })

        const keys = {
            w: {pressed: false},
            a: {pressed: false},
            s: {pressed: false},
            d: {pressed: false}
        }

        const movables = [background, ...boundariesObjets]    

        function retangularCollision({rectangle1, rectangle2}) {
            return (
                    rectangle1.position.x + rectangle1.width - 17 >= rectangle2.position.x 
                    && rectangle1.position.x + 17 <= rectangle2.position.x + rectangle2.width 
                    && rectangle1.position.y + rectangle1.height - 5 >= rectangle2.position.y 
                    && rectangle1.position.y + 13 <= rectangle2.position.y + rectangle2.height
                    )
        }

        function animate(){ 
            window.requestAnimationFrame(animate)
            background.draw() 
            boundariesObjets.forEach(limitz => { // gerar o array de fronteiras
                limitz.draw()
                // console.log(limitz)
                if (retangularCollision({rectangle1: player, rectangle2: limitz})) {
                        console.log('colidiu porra!!!')
                } 
            })
            // testBoundary.draw()
            player.draw()
            
           

            if (keys.w.pressed && lastKey === 'w') {
                movables.forEach(jorge => {
                    jorge.position.y += 3
                })
            } else if (keys.s.pressed && lastKey === 's') {
                movables.forEach(jorge => {
                    jorge.position.y -= 3
                })
            } else if (keys.a.pressed && lastKey === 'a') {
                movables.forEach(jorge => {
                    jorge.position.x += 3
                })
            } else if (keys.d.pressed && lastKey === 'd') {
                movables.forEach(jorge => {
                    jorge.position.x -= 3
                })
            }    

            
        }
        animate() 

        window.addEventListener('keydown', (e) => { // essa função faz com que toda vez que a seta para baixo seja apertada chama a arrow function
                switch (e.key) { // pelo que parece o uso aqui é facultativo, eu tentei com if e funcionou
                    case 'w': 
                        keys.w.pressed = true
                        lastKey = 'w'
                        break
                    case 'a':
                        keys.a.pressed = true
                        lastKey = 'a'                        
                        break
                    case 's': 
                        keys.s.pressed = true
                        lastKey = 's'
                        break
                    case 'd': 
                        keys.d.pressed = true
                        lastKey = 'd'
                        break
                }
        })

        window.addEventListener('keyup', (e) => { 
                switch (e.key) { 
                    case 'w': 
                        keys.w.pressed = false
                        break
                    case 'a':
                        keys.a.pressed = false
                        break
                    case 's': 
                        keys.s.pressed = false
                        break
                    case 'd': 
                        keys.d.pressed = false
                        break
                }
        })

	})
	
</script>

<main>
    <div id="desenho">
        <canvas bind:this={canvas}></canvas> 
    </div>    
</main>

<style>
    * {
        padding: 0;
        margin: 0;
    }
	main {
        width: 100vw;
        height: 100vh;
		display: flex; 
		justify-content: center;
		align-items: center;
		
	}
	#desenho {
        position: absolute; 
	}
</style>