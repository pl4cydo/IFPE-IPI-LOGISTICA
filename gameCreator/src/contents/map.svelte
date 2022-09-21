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
            // static width = 38.4;
            // static height = 38.4;
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

		// c.fillStyle = 'white'; //  o fillStyle serve para declarar a cor da pintura do canvas, nesse em especifico é para a tela
		// c.fillRect(0,0,canvas.width, canvas.height); // fillRect é a declaração do retangulo, os dois primeiro zeros são os pontos iniciais da tela onde o senho do fillStyle vai começar 

        const imageMap = new Image(); // declarando uma constante para criar um novo objeto da classe Image
        imageMap.src= './images/mini-mapa.png' // aqui está chamando um dos topicos do objeto e declarando o caminho, muito parecido como o CSS sendo chamado pelo JS

        const imagePlayer = new Image(); 
        imagePlayer.src = './images/redSprite.png'

        class Sprite { // criando um objeto que recebe os paremetros para se desenhar e mover no canvas
            constructor({position,velocity, image}){
                this.position = position;
                this.image = image;
            }

            draw(){
             c.drawImage(this.image, this.position.x, this.position.y) // aqui estamos desenhando a imagem do mapa no canvas, chamando o objeto do mapa que já tem os tamanhos, então só é preciso dizer onde o x e o y estão    
            }
        }

        const background = new Sprite({ // novo objeto de background contendo a imagem do mapa e o local onde ele vai aparecer
            position: {x: offset.x,y: offset.y}, 
            image: imageMap
        })

        const keys = { // objeto que declara os botões de movimentação como false para que eles só se movimentem quando realmente estiver pressionado
            w: {
                pressed: false
            },
            a: {
                pressed: false
            },
            s: {
                pressed: false
            },
            d: {
                pressed: false
            },
        }

        function animate(){ // função que anima as imagens que fica redesenhando em recursão 
            window.requestAnimationFrame(animate)
            background.draw() // chamando objeto background que contem o mapa
            boundaries.forEach(limitz => { // gerar o array de fronteiras
                limitz.draw()
                console.log(limitz)
            })
            c.drawImage( // Declarando os Sprite do personagem com varias funções a mais
                imagePlayer, // o objeto
                0, //onde o corte da imagem no eixo X começa
                0, //onde o corte da imagem no eixo Y começa
                imagePlayer.width / 4, //onde o corte da imagem no eixo X termina 
                imagePlayer.height / 4, //onde o corte da imagem no eixo Y termina 
                canvas.width/2 - imagePlayer.width/4, // esses aqui tem a ver com a localização no mapa, porém ainda um pouco confusos
                canvas.height/2 - imagePlayer.height/4,
                imagePlayer.width / 4,
                imagePlayer.height / 4, // meio confuso esses ultimos 4
                )

            if (keys.w.pressed && lastKey === 'w') {
                background.position.y += 3
            }
            if (keys.s.pressed && lastKey === 's') {
                background.position.y -= 3
            }
            if (keys.a.pressed && lastKey === 'a') {
                background.position.x += 3
            }
            if (keys.d.pressed && lastKey === 'd') {
                background.position.x -= 3
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