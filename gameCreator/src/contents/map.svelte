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

    const arrayPlayerImage = ['./images/redSpriteDOWN.png', './images/redSpriteLEFT.png', './images/redSpriteUP.png', './images/redSpriteRIGTH.png']

	onMount(() => { // chamando a função onde o canvas vai ser posto
        canvas.width = 1024; // tamanho da largura do canvas
        canvas.height = 720; // tamanho da altura do canvas
		const c = canvas.getContext('2d'); // criando uma variavel e chamando o canvas para declarar o contexto 2D
        let lastKey = ''


        const imageMap = new Image();
        imageMap.src= './images/mini-mapa.png' 

        const imageDOWNPlayer = new Image(); 
        imageDOWNPlayer.src = './images/redSpriteDOWN.png'
        
        const imageUPPlayer = new Image(); 
        imageUPPlayer.src = './images/redSpriteUP.png'

        const imageLEFTPlayer = new Image(); 
        imageLEFTPlayer.src = './images/redSpriteLEFT.png'

        const imageRIGHTPlayer = new Image(); 
        imageRIGHTPlayer.src = './images/redSpriteRIGHT.png'

        const boundariesObjets = [];

        const offset = {
            x: -635,
            y: -370
        }


        class Sprite { 
            constructor({position, velocity, image, frames = {max: 1}, sprites}){
                this.position = position;
                this.image = image;
                this.frames = { 
                            ...frames,
                            val: 0,
                            elapsed: 0
                            };
                this.image.onload = () => {
                    this.width = this.image.width / this.frames.max
                    this.height = this.image.height
                }
                this.moving = false 
                this.sprites = sprites
            }

            draw(){
                c.drawImage(
                    this.image,
                    this.frames.val * this.width, 
                    0, 
                    this.image.width / this.frames.max, 
                    this.image.height,
                    this.position.x,
                    this.position.y,
                    this.image.width / this.frames.max,
                    this.image.height, 
                )

                if (!this.moving) return
                if ( this.frames.max > 1) {
                    this.frames.elapsed++
                }

                if  ( this.frames.elapsed % 10 == 0) {
                    if (this.frames.val < this.frames.max - 1) this.frames.val++
                        else this.frames.val = 0
                }
            }
        }

        class Boundary {
            constructor({position}){
                this.position = position;
                this.width = 38.4;
                this.height = 38.4;
            }
            draw(){
             c.fillStyle = 'rgba(255, 0, 0, 0)'
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
            image: imageDOWNPlayer,
            frames: {
                max: 4
            },
            sprites: {
                    down: imageDOWNPlayer,
                    up: imageUPPlayer,
                    left: imageLEFTPlayer,
                    right: imageRIGHTPlayer
                }
        })

        const background = new Sprite({ 
            position: {
                x: offset.x,
                y: offset.y
            }, 
            image: imageMap
        })

        const keys = {
            w: {pressed: false},
            a: {pressed: false},
            s: {pressed: false},
            d: {pressed: false}
        }

        const movables = [background, ...boundariesObjets]    

        function rectangularCollision({rectangle1, rectangle2}) {
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
                
            })
            // testBoundary.draw()
            player.draw()
            
            
            let moving = true
            player.moving = false
            if (keys.w.pressed && lastKey === 'w') {
                player.moving = true
                player.image = player.sprites.up
                for (let i = 0; i < boundariesObjets.length; i++){
                    const limitz = boundariesObjets[i]
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                ...limitz,
                                position: {
                                    x: limitz.position.x,
                                    y: limitz.position.y + 3
                                }
                            }
                        })
                    ) {
                        moving = false
                        break
                    } 
                }
                if(moving) {
                    movables.forEach(jorge => {
                        jorge.position.y += 1.7
                    })
                }
            } else if (keys.s.pressed && lastKey === 's') {
                player.moving = true
                player.image = player.sprites.down
                for (let i = 0; i < boundariesObjets.length; i++){
                    const limitz = boundariesObjets[i]
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                ...limitz,
                                position: {
                                    x: limitz.position.x,
                                    y: limitz.position.y - 3 
                                }
                            }
                        })
                    ) {
                        moving = false
                        break
                    } 
                }
                if(moving) {
                    movables.forEach(jorge => {
                        jorge.position.y -= 1.7
                    })
                }
            } else if (keys.a.pressed && lastKey === 'a') {
                player.moving = true
                player.image = player.sprites.left
                for (let i = 0; i < boundariesObjets.length; i++){
                    const limitz = boundariesObjets[i]
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                ...limitz,
                                position: {
                                    x: limitz.position.x + 3,
                                    y: limitz.position.y 
                                }
                            }
                        })
                    ) {
                        moving = false
                        break
                    } 
                }
                if(moving) {
                    movables.forEach(jorge => {
                        jorge.position.x += 1.7
                    })
                }
            } else if (keys.d.pressed && lastKey === 'd') {
                player.moving = true
                player.image = player.sprites.right
                for (let i = 0; i < boundariesObjets.length; i++){
                    const limitz = boundariesObjets[i]
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                ...limitz,
                                position: {
                                    x: limitz.position.x - 3,
                                    y: limitz.position.y
                                }
                            }
                        })
                    ) {
                        moving = false
                        break
                    } 
                }
                if(moving) {
                    movables.forEach(jorge => {
                        jorge.position.x -= 1.7
                    })
                }
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