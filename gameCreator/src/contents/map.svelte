<script>
	import { onMount } from 'svelte'; // importando a função onMount da biblioteca do svelte para poder usar o canvas
	
	let canvas; // declarando uma variavel para o canvas
	
	onMount(() => { // chamando a função onde o canvas vai ser posto
        canvas.width = 1024; // tamanho da largura do canvas
        canvas.height = 576; // tamanho da altura do canvas
		const ctx = canvas.getContext('2d'); // criando uma variavel e chamando o canvas para declarar o contexto 2D
		
		ctx.fillStyle = 'white'; //  o fillStyle serve para declarar a cor da pintura do canvas, nesse em especifico é para a tela
		ctx.fillRect(0,0,canvas.width, canvas.height); // fillRect é a declaração do retangulo, os dois primeiro zeros são os pontos iniciais da tela onde o senho do fillStyle vai começar 

        const imageMap = new Image(); // declarando uma constante para criar um novo objeto da classe Image
        imageMap.src= './images/mapa1.png' // aqui está chamando um dos topicos do objeto e declarando o caminho, muito parecido como o CSS sendo chamado pelo JS

        const imagePlayer = new Image(); 
        imagePlayer.src = './images/redSprite.png'

        class Sprite {
            constructor({position,velocity, image}){
                this.position = position;
                this.image = image;
            }

            draw(){
                ctx.drawImage(this.image, this.position.x, this.position.y) // aqui estamos desenhando a imagem do mapa no canvas, chamando o objeto do mapa que já tem os tamanhos, então só é preciso dizer onde o x e o y estão    
            }
        }

        const background = new Sprite({
            position: {
                x: +200,
                y: -600
            }, 
            image: imageMap
        })

        const keys = {
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
            ctx.drawImage( // Declarando os Sprite do personagem com varias funções a mais
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
            if (keys.w.pressed) {
                background.position.y += 3
            } else if (keys.s.pressed) {
                background.position.y -= 3
            }
            if (keys.a.pressed) {
                background.position.x += 3
            } else if (keys.d.pressed) {
                background.position.x -= 3
            }    

            
        }
        animate()

        window.addEventListener('keydown', (e) => { // essa função faz com que toda vez que a seta para baixo seja apertada chama a arrow function
                switch (e.key) { // pelo que parece o uso aqui é facultativo, eu tentei com if e funcionou
                    case 'w': 
                        keys.w.pressed = true
                        break
                    case 'a':
                        keys.a.pressed = true
                        break
                    case 's': 
                        keys.s.pressed = true
                        break
                    case 'd': 
                        keys.d.pressed = true
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
    <body>
        <canvas bind:this={canvas} id="desenho"></canvas> <!-- Chamar a tag canvas dentro html e dizer que essa tag vai ser referente as mudanças da tag canvas do JS -->

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