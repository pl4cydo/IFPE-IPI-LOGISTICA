<script>
  import { onMount } from "svelte";
  import { collision } from "../stores";
  import TelaTeste from "../Tasks/telaTeste.svelte";
  import TelaTeste1 from "../Tasks/telaTeste1.svelte";
  import TelaTeste2 from "../Tasks/telaTeste2.svelte";
  import { estado } from "../Estado";
  import { trocarEstadoDoJogo } from "../Estado";
  import { Task0 } from "../stores";
  import { Task1 } from "../stores";
  import { Task2 } from "../stores";
  import { life } from "../stores";
  import { walk } from "../stores";
  import EpiTask from "../Tasks/lib/EpiTask.svelte";

  // 03:05

  let canvas;

  onMount(() => {
    // declaração da função onMount para poder usar o canvas dentro do SVELTE
    // declarando o tamanho do canvas na tela
    canvas.width = 780;
    canvas.height = 520;
    const c = canvas.getContext("2d"); // constexto 2d do canvas

    // classe base para a criação das fronteiras de colisão do código
    class Boundary {
      constructor({ position }) {
        this.position = position; // recebe um objeto de posião x e y
        (this.width = 54), 4; // a largura do objeto de fronteira é a operação de 170% de 32 (que é o tamanho do tiled em pixel)
        (this.height = 54), 4; // o mesmo para a altura
      }
      draw() {
        // função de desenho
        c.fillStyle = "rgba(255, 0, 0, 0)";
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
      }
      draw2() {
        // função de desenho
        c.fillStyle = "rgba(0, 0, 255, 0)";
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
      }
    }
    const offset = {
      x: -1620,
      y: -250,
    };

    // Area de testes  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const arrTask0 = [];
    $Task0.forEach((el, i) => {
      el.forEach((ment, j) => {
        if (ment === 1) {
          arrTask0.push(
            new Boundary({
              position: {
                x: j * 54.4 + offset.x,
                y: i * 54.4 + offset.y,
              },
            })
          );
        }
      });
    });

    const arrTask1 = [];
    $Task1.forEach((el, i) => {
      el.forEach((ment, j) => {
        if (ment === 1) {
          arrTask1.push(
            new Boundary({
              position: {
                x: j * 54.4 + offset.x,
                y: i * 54.4 + offset.y,
              },
            })
          );
        }
      });
    });

    const arrTask2 = [];
    $Task2.forEach((el, i) => {
      el.forEach((ment, j) => {
        if (ment === 1) {
          arrTask2.push(
            new Boundary({
              position: {
                x: j * 54.4 + offset.x,
                y: i * 54.4 + offset.y,
              },
            })
          );
        }
      });
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // constante vazia que para guardar a posição dos objetos
    const arrBoundaries = [];

    //metodo que percorre o array importado que para cada elemento de elemento cria um novo objeto boundary e coloca dentro do arrBoundaries com sua posição
    $collision.forEach((element, i) => {
      element.forEach((row, j) => {
        if (row === 1) {
          arrBoundaries.push(
            new Boundary({
              position: {
                x: j * 54.4 + offset.x,
                y: i * 54.4 + offset.y,
              },
            })
          );
        }
      });
    });

    //declarando as imagens do game
    const mapa = new Image();
    mapa.src = "./images/ProjetoMapa1.png";

    const spriteDown = new Image();
    spriteDown.src = "./images/redSpriteDOWN.png";
    const spriteUp = new Image();
    spriteUp.src = "./images/redSpriteUP.png";
    const spriteLeft = new Image();
    spriteLeft.src = "./images/redSpriteLEFT.png";
    const spriteRight = new Image();
    spriteRight.src = "./images/redSpriteRIGHT.png";

    // a imagem do sprite tem 256 px de largura, isso dividido por 4 é igual a 64

    //teste de para iniciar task
    let jorge = {
      rod: false,
      life: true,
    };

    // molde que para criar objetos com propriedades de local na tela para poder movimentar alterando esses parametros
    class SpriteMoviment {
      constructor({ position, image, frames = { max: 1 }, sprites }) {
        this.position = position;
        this.image = image;
        this.frames = { ...frames, val: 0, elapsed: 0 };

        this.image.onload = () => {
          this.width = this.image.width / this.frames.max;
          this.height = this.image.height;
        };
        this.moving = false;
        this.sprites = sprites;
      }
      //metodo que desenha dentro do objeto para facilitar o processo em outros obejtos
      draw() {
        c.drawImage(
          this.image,
          //cropping
          this.frames.val * this.width, // inicio do x da imagem
          0, // inicio do y da imagem
          this.image.width / this.frames.max, // fim do x
          this.image.height, // fim do y
          //position
          this.position.x,
          this.position.y,
          this.image.width / this.frames.max,
          this.image.height
        );

        if (!this.moving) return;

        if (this.frames.max > 1) {
          this.frames.elapsed++;
        }
        if (this.frames.elapsed % 10 === 0) {
          if (this.frames.val < this.frames.max - 1) this.frames.val++;
          else this.frames.val = 0;
        }
      }
    }

    // Objeto que gera o personagem no mapa
    const player = new SpriteMoviment({
      position: {
        x: canvas.width / 2 - 256 / 4 / 2,
        y: canvas.height / 2 - 68 / 2,
      },
      image: spriteDown,
      frames: {
        max: 4,
      },
      sprites: {
        up: spriteUp,
        down: spriteDown,
        left: spriteLeft,
        rigth: spriteRight,
      },
    });

    // objeto criado a partir da class SpriteMoviment com objetivo de guardar as iformações do eixo x e y da imagem do mapa para poder ser alterado e criar a ilusão de movimento
    const background = new SpriteMoviment({
      position: {
        x: offset.x,
        y: offset.y,
      },
      image: mapa,
    });

    // prototype object criado para setar informações na mesma constante e não ter que criar varias constantes diferentes
    // tem como objetivo ser alterado quando o keydonw da letra especifica for pressionado, sendo transformado em true
    const keys = {
      w: {
        pressed: false,
      },
      a: {
        pressed: false,
      },
      s: {
        pressed: false,
      },
      d: {
        pressed: false,
      },
    };

    // array de objeto que vao ser movimentados, alterando as posições de x e y dos dois ao "mesmo tempo"
    const movebles = [
      background,
      ...arrBoundaries,
      ...arrTask0,
      ...arrTask1,
      ...arrTask2,
    ];

    // função que verifica se o personagem ta no mesmo lugar que as fronteiras
    function rectungularCollision({ rectung1, rectung2 }) {
      return (
        rectung1.position.x + rectung1.width - 15 >= rectung2.position.x &&
        rectung1.position.x + 15 <= rectung2.position.x + rectung2.width &&
        rectung1.position.y + 15 <= rectung2.position.y + rectung2.height &&
        rectung1.position.y + rectung1.height >= rectung2.position.y
      );
    }

    // função recursiva que chama a si propria em relação a movimentação da janela do canvas
    function animate() {
      window.requestAnimationFrame(animate); // chamada da função dentro da função
      // desenhando as imagens dentro do canvas em um loop infinito para causar a ilusão de movimento
      background.draw();
      player.draw();

      // forEach que fica passando to todos os objetos dentro de arrBoundary e gerando eles no mapa
      arrBoundaries.forEach((element) => {
        element.draw();
      });

      //objeto que gera as areas de tasks
      // Task 0
      arrTask0.forEach((el) => {
        el.draw2();
      });
      // Task 1
      arrTask1.forEach((el) => {
        el.draw2();
      });
      // Task 2
      arrTask2.forEach((el) => {
        el.draw2();
      });

      let moving = true;
      player.moving = false;
      // consdicionais que caso o parametro for true almenta ou diminue a posição da imagem do mapa
      if ($walk) {
        if (keys.w.pressed && lastKey === "w") {
          player.moving = true;
          player.image = player.sprites.up;
          // esse for tem como objetivo prever a colisão entre o personagem e a frotneira quando a tecla é apertada, quando isso acontece ele transforma a varaivel booleana em false e para o movimento
          for (let i = 0; i < arrBoundaries.length; i++) {
            const element = arrBoundaries[i];
            if (
              rectungularCollision({
                rectung1: player,
                rectung2: {
                  ...element,
                  position: {
                    x: element.position.x,
                    y: element.position.y + 25,
                  },
                },
              })
            ) {
              console.log("colidiu");
              moving = false;
              break;
            }
          }

          if (moving)
            movebles.forEach((element) => {
              element.position.y += 1.7;
            });
        } else if (keys.a.pressed && lastKey === "a") {
          player.moving = true;
          player.image = player.sprites.left;
          // esse for tem como objetivo prever a colisão entre o personagem e a frotneira quando a tecla é apertada, quando isso acontece ele transforma a varaivel booleana em false e para o movimento
          for (let i = 0; i < arrBoundaries.length; i++) {
            const element = arrBoundaries[i];
            if (
              rectungularCollision({
                rectung1: player,
                rectung2: {
                  ...element,
                  position: {
                    x: element.position.x + 3,
                    y: element.position.y,
                  },
                },
              })
            ) {
              console.log("colidiu");
              moving = false;
              break;
            }
          }

          if (moving)
            movebles.forEach((element) => {
              element.position.x += 1.7;
            });
        } else if (keys.s.pressed && lastKey === "s") {
          player.moving = true;
          player.image = player.sprites.down;
          // esse for tem como objetivo prever a colisão entre o personagem e a frotneira quando a tecla é apertada, quando isso acontece ele transforma a varaivel booleana em false e para o movimento
          for (let i = 0; i < arrBoundaries.length; i++) {
            const element = arrBoundaries[i];
            if (
              rectungularCollision({
                rectung1: player,
                rectung2: {
                  ...element,
                  position: {
                    x: element.position.x,
                    y: element.position.y - 3,
                  },
                },
              })
            ) {
              console.log("colidiu");
              moving = false;
              break;
            }
          }

          if (moving)
            movebles.forEach((element) => {
              element.position.y -= 1.7;
            });
        } else if (keys.d.pressed && lastKey === "d") {
          player.moving = true;
          player.image = player.sprites.rigth;
          // esse for tem como objetivo prever a colisão entre o personagem e a frotneira quando a tecla é apertada, quando isso acontece ele transforma a varaivel booleana em false e para o movimento
          for (let i = 0; i < arrBoundaries.length; i++) {
            const element = arrBoundaries[i];
            if (
              rectungularCollision({
                rectung1: player,
                rectung2: {
                  ...element,
                  position: {
                    x: element.position.x - 3,
                    y: element.position.y,
                  },
                },
              })
            ) {
              console.log("colidiu");
              moving = false;
              break;
            }
          }

          if (moving)
            movebles.forEach((element) => {
              element.position.x -= 1.7;
            });
        }
      }

      // test de iniciação de task
      if (jorge.rod) {
        // rtoda vez que aperti espaço transforam jorge.rod em true e quando solto volta a ser false
        // console.log('basbabsdba')
        arrTask0.forEach((el) => {
          // esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
          if (
            rectungularCollision({
              rectung1: player,
              rectung2: { ...el },
            })
          ) {
            console.log("task 0");
            epiContainer.style.display = "flex";
            game.style.display = "none";
            $walk = false;
          }
        });

        arrTask1.forEach((el) => {
          // esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
          if (
            rectungularCollision({
              rectung1: player,
              rectung2: { ...el },
            })
          ) {
            console.log("task 1");
            task1.style.display = "flex";
            game.style.display = "none";
            $walk = false;
          }
        });

        arrTask2.forEach((el) => {
          // esse loop via passar por todas as aeras de tasks e verificar se o player esta dentro
          if (
            rectungularCollision({
              rectung1: player,
              rectung2: { ...el },
            })
          ) {
            console.log("task 2");
            task2.style.display = "flex";
            game.style.display = "none";
            $walk = false;
          }
        });
      }
    }
    animate();

    // variavel criada para comportar uma string com a ultima tecla pressionada, fazendo com que o personagem não fique preso em uma unica direção
    let lastKey = "";

    // metodo que analisa os eventos na tela da aplicação
    // em espeficico as teclas pressionadas (keydown)
    window.addEventListener("keydown", (e) => {
      // console.log(e)
      switch (e.key.toLocaleLowerCase()) {
        case " ":
          jorge.rod = true;
          jorge.life = true;
          // console.log(jorge.rod)
          break;
        case "w":
          keys.w.pressed = true;
          lastKey = "w";
          break;
        case "a":
          keys.a.pressed = true;
          lastKey = "a";
          break;
        case "s":
          keys.s.pressed = true;
          lastKey = "s";
          break;
        case "d":
          keys.d.pressed = true;
          lastKey = "d";
          break;
      }
    });

    // esse evento faz o contrario do keydown, quando a tecla é solta ele volta a ser false
    window.addEventListener("keyup", (e) => {
      switch (e.key.toLocaleLowerCase()) {
        case " ":
          jorge.rod = false;
          jorge.life = false;
          // console.log(jorge.rod)
          break;
        case "w":
          keys.w.pressed = false;
          break;
        case "a":
          keys.a.pressed = false;
          break;
        case "s":
          keys.s.pressed = false;
          break;
        case "d":
          keys.d.pressed = false;
          break;
      }
    });
  });
</script>

<main>
  <div id="game">
    <div id="tela1">
      <canvas bind:this={canvas} />
      <h1>Life: {$life}</h1>
    </div>
  </div>
  <EpiTask />
  <TelaTeste />
  <TelaTeste1 />
  <TelaTeste2 />
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
  }
  #game {
    /* width: 100vw;
    height: 100vh; */
    justify-content: center;
    align-items: center;
    display: flex;
    position: relative;
    /* background-color: gray; */
    margin: 0;
    padding: 0;
    
  }

  #tela1 {
    width: 780px;
    height: 520px;
    justify-content: center;
    align-items: center;
    display: flex;
    border: 1px solid black;
  }
  canvas {
    border: 1px solid;
    border-color: black;
    position: absolute;
  }
  h1 {
    margin-top: 640px;
  }
</style>
