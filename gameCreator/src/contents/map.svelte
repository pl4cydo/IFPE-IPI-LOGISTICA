<script>
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

        const boundaries = [];

        const offset = {
            x: -635,
            y: -370
        }

        let test = {
            x: 0,
            y: 0
        }

        collisionsMap.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if(symbol == 5){
                    boundaries.push(
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

        // console.log(boundaries)

        const imageMap = new Image();
        imageMap.src= './images/mini-mapa.png' 
        const imagePlayer = new Image(); 
        imagePlayer.src = './images/redSprite.png'

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

        // canvas.width/2 - this.image.width/4,
        // canvas.height/2 - this.image.height/4,

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

        const background = new Sprite({ // novo objeto de background contendo a imagem do mapa e o local onde ele vai aparecer
            position: {
                x: offset.x,
                y: offset.y
            }, 
            image: imageMap
        })

        const keys = { // objeto que declara os botões de movimentação como false para que eles só se movimentem quando realmente estiver pressionado
            w: {pressed: false},
            a: {pressed: false},
            s: {pressed: false},
            d: {pressed: false}
        }

        const testBoundary = new Boundary({
            position: {
                x: 517,
                y: 250
            }
        })
        const movables = [background, testBoundary]    

        function animate(){ // função que anima as imagens que fica redesenhando em recursão 
            window.requestAnimationFrame(animate)
            background.draw() // chamando objeto background que contem o mapa
            // boundaries.forEach(limitz => { // gerar o array de fronteiras
            //     limitz.draw()
            //     // console.log(limitz)
            // })
            testBoundary.draw()
            player.draw()
            
            if (player.position.x + player.width >= testBoundary.position.x && player.position.x + player.width <= testBoundary.position.x + testBoundary.width) {
                console.log('colidiu porra!!!')
            } 

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

        let lastKey = '' // funciona como uma verificação para qual a ultima tecla pressionada

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
        <canvas bind:this={canvas}></canvas> <!-- Chamar a tag canvas dentro html e dizer que essa tag vai ser referente as mudanças da tag canvas do JS -->
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