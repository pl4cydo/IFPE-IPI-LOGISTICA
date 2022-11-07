<script>
    // TO DO: resolver movimentação com capslock

    import { onMount } from "svelte"; // importando a função onMount da biblioteca do svelte para poder usar o canvas
    let canvas; // declarando uma variavel para o canvas
    const collisionsMap = [
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 5, 5, 5, 5, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 5, 5, 5, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 5, 5,
            5, 5, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 5, 0,
            0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 5, 0,
            0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 5, 0,
            0, 0, 0, 0, 0, 0, 4, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0,
            0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 5, 5, 5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 5, 5, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 0, 5, 5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 5, 5, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            5, 5, 5, 5, 0, 0, 0, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 5, 5, 5, 5, 5, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
    ];

    onMount(() => {
        // chamando a função onde o canvas vai ser posto
        canvas.width = innerWidth * 0.60; // tamanho da largura do canvas
        canvas.height = innerHeight * 0.80; // tamanho da altura do canvas
        const c = canvas.getContext("2d"); // criando uma variavel e chamando o canvas para declarar o contexto 2D
        let lastKey = "";

        // Imagens usadas no codigo
        const imageMap = new Image();
        imageMap.src = "./images/mini-mapa.png";

        const imageDOWNPlayer = new Image();
        imageDOWNPlayer.src = "./images/redSpriteDOWN.png";

        const imageUPPlayer = new Image();
        imageUPPlayer.src = "./images/redSpriteUP.png";

        const imageLEFTPlayer = new Image();
        imageLEFTPlayer.src = "./images/redSpriteLEFT.png";

        const imageRIGHTPlayer = new Image();
        imageRIGHTPlayer.src = "./images/redSpriteRIGHT.png";

        // arrays que contem os objetos gerados no mapa
        const boundariesObjets = [];
        const tasksObjects = [];

        // objeto que contem a posiçao do mapa
        const offset = {
            x: -635,
            y: -370,
        };

        const life = {
            base: 100,
            realTime: 100,
        };

        //classes das imagens para gerar os movimentos
        class Sprite {
            constructor({ position, image, frames = { max: 1 }, sprites }) {
                this.position = position;
                this.image = image;
                this.frames = {
                    ...frames,
                    val: 0,
                    elapsed: 0,
                };
                this.image.onload = () => {
                    this.width = this.image.width / this.frames.max;
                    this.height = this.image.height;
                };
                this.moving = false;
                this.sprites = sprites;
            }

            draw() {
                c.drawImage(
                    this.image,
                    this.frames.val * this.width,
                    0,
                    this.image.width / this.frames.max,
                    this.image.height,
                    this.position.x,
                    this.position.y,
                    this.image.width / this.frames.max,
                    this.image.height
                );

                if (!this.moving) return;
                if (this.frames.max > 1) {
                    this.frames.elapsed++;
                }

                if (this.frames.elapsed % 10 == 0) {
                    if (this.frames.val < this.frames.max - 1)
                        this.frames.val++;
                    else this.frames.val = 0;
                }
            }
        }

        class Boundary {
            constructor({ position }) {
                this.position = position;
                this.width = 38.4;
                this.height = 38.4;
            }
            draw() {
                c.fillStyle = "rgba(255, 0, 0, 0)";
                c.fillRect(
                    this.position.x,
                    this.position.y,
                    this.width,
                    this.height
                );
            }
        }

        collisionsMap.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if (symbol == 5) {
                    boundariesObjets.push(
                        new Boundary({
                            position: {
                                x: j * 38.4 + offset.x,
                                y: i * 38.4 + offset.y,
                            },
                        })
                    );
                }
            });
        });

        class Tasks {
            constructor({ position }) {
                this.position = position;
                this.width = 38.4;
                this.height = 38.4;
                this.contato = false;
            }
            draw() {
                c.fillStyle = "rgba(0, 255, 0, 0.5)";
                c.fillRect(
                    this.position.x,
                    this.position.y,
                    this.width,
                    this.height
                );
            }
        }

        collisionsMap.forEach((jorge, i) => {
            jorge.forEach((vasco, j) => {
                if (vasco == 4) {
                    tasksObjects.push(
                        new Tasks({
                            position: {
                                x: j * 38.4 + offset.x,
                                y: i * 38.4 + offset.y,
                            },
                        })
                    );
                }
            });
        });
        // console.log(boundariesObjets)

        const player = new Sprite({
            position: {
                x: canvas.width / 2 - 256 / 4,
                y: canvas.height / 2 - 256 / 4,
            },
            image: imageDOWNPlayer,
            frames: {
                max: 4,
            },
            sprites: {
                down: imageDOWNPlayer,
                up: imageUPPlayer,
                left: imageLEFTPlayer,
                right: imageRIGHTPlayer,
            },
        });

        const background = new Sprite({
            position: {
                x: offset.x,
                y: offset.y,
            },
            image: imageMap,
        });

        const keys = {
            w: { pressed: false },
            a: { pressed: false },
            s: { pressed: false },
            d: { pressed: false },
            o: { pressed: false },
        };

        const movables = [background, ...boundariesObjets, ...tasksObjects];

        function rectangularCollision({ rectangle1, rectangle2 }) {
            return (
                rectangle1.position.x + rectangle1.width - 17 >=
                    rectangle2.position.x &&
                rectangle1.position.x + 17 <=
                    rectangle2.position.x + rectangle2.width &&
                rectangle1.position.y + rectangle1.height - 5 >=
                    rectangle2.position.y &&
                rectangle1.position.y + 13 <=
                    rectangle2.position.y + rectangle2.height
            );
        }

        function animate() {
            window.requestAnimationFrame(animate);
            background.draw();
            boundariesObjets.forEach((limitz) => {
                // gerar o array de fronteiras
                limitz.draw();
            });
            tasksObjects.forEach((jorge) => {
                jorge.draw();
            });

            player.draw();

            function taskColid() {
                for (let i = 0; i < tasksObjects.length; i++) {
                    const jorge = tasksObjects[i];
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: jorge,
                        })
                    ) {
                        if (keys.o.pressed) {
                            console.log("deu certo");
                        }
                        life.realTime -= 1;
                        console.log(life.realTime);
                        if (life.realTime <= 0) life.realTime = life.base;
                    }
                }
            }

            let moving = true;
            player.moving = false;
            if (keys.w.pressed && lastKey === "w") {
                player.moving = true;
                player.image = player.sprites.up;
                for (let i = 0; i < boundariesObjets.length; i++) {
                    const limitz = boundariesObjets[i];
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                ...limitz,
                                position: {
                                    x: limitz.position.x,
                                    y: limitz.position.y + 3,
                                },
                            },
                        })
                    ) {
                        moving = false;
                        break;
                    }
                }
                if (moving) {
                    movables.forEach((movi) => {
                        taskColid();
                        movi.position.y += 1.7;
                    });
                }
            } else if (keys.s.pressed && lastKey === "s") {
                player.moving = true;
                player.image = player.sprites.down;
                for (let i = 0; i < boundariesObjets.length; i++) {
                    const limitz = boundariesObjets[i];
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                ...limitz,
                                position: {
                                    x: limitz.position.x,
                                    y: limitz.position.y - 3,
                                },
                            },
                        })
                    ) {
                        moving = false;
                        break;
                    }
                }
                if (moving) {
                    movables.forEach((jorge) => {
                        taskColid();
                        jorge.position.y -= 1.7;
                    });
                }
            } else if (keys.a.pressed && lastKey === "a") {
                player.moving = true;
                player.image = player.sprites.left;
                for (let i = 0; i < boundariesObjets.length; i++) {
                    const limitz = boundariesObjets[i];
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                ...limitz,
                                position: {
                                    x: limitz.position.x + 3,
                                    y: limitz.position.y,
                                },
                            },
                        })
                    ) {
                        moving = false;
                        break;
                    }
                }
                if (moving) {
                    movables.forEach((jorge) => {
                        jorge.position.x += 1.7;
                        taskColid();
                    });
                }
            } else if (keys.d.pressed && lastKey === "d") {
                player.moving = true;
                player.image = player.sprites.right;
                for (let i = 0; i < boundariesObjets.length; i++) {
                    const limitz = boundariesObjets[i];
                    if (
                        rectangularCollision({
                            rectangle1: player,
                            rectangle2: {
                                ...limitz,
                                position: {
                                    x: limitz.position.x - 3,
                                    y: limitz.position.y,
                                },
                            },
                        })
                    ) {
                        moving = false;
                        break;
                    }
                }
                if (moving) {
                    movables.forEach((jorge) => {
                        jorge.position.x -= 1.7;
                        taskColid();
                    });
                }
            }
        }
        animate();

        window.addEventListener("keydown", (e) => {
            // essa função faz com que toda vez que a seta para baixo seja apertada chama a arrow function
            switch (
                e.key // pelo que parece o uso aqui é facultativo, eu tentei com if e funcionou
            ) {
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
                case " ":
                    keys.o.pressed = true;
                    break;
            }
        });

        window.addEventListener("keyup", (e) => {
            switch (e.key) {
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
                case " ":
                    keys.o.pressed = false;
                    break;
            }
        });

        var click;
        var bolea = { x: null, y: null, Tx: false };
        var SumXY = { Cx: 0, Cy: 0 };
        var galopa = false;

        window.addEventListener("keydown", (e) => {
            console.log(e.key);
            if (e.key === "Tab") {
                galopa = true;
            }
            if (e.key === "y") {
                galopa = false;
            }
        });
        var render = function () {
            window.requestAnimationFrame(render);
            //context.drawImage(player, context.canvas.width / 2.45, context.canvas.height / 2, 80, 60)

            if (bolea.x == true && background.position.x > SumXY.Cx && galopa) {
                //direita
                keys.d.pressed = true;
                lastKey = "d";
                background.position.x -= 1;
            } else if (
                bolea.x == false &&
                background.position.x < SumXY.Cx &&
                galopa
            ) {
                //esquerda
                keys.a.pressed = true;
                lastKey = "a";
                background.position.x += 1;
            } else if (!bolea.Tx && galopa) {
                keys.a.pressed = false;
                keys.d.pressed = false;
                lastKey = "";
                bolea.Tx = true;
            }

            if (
                bolea.y == true &&
                background.position.y > SumXY.Cy &&
                bolea.Tx &&
                galopa
            ) {
                keys.s.pressed = true;
                lastKey = "s";
                background.position.y -= 1;
            } else if (
                bolea.y == false &&
                background.position.y < SumXY.Cy &&
                bolea.Tx &&
                galopa
            ) {
                keys.w.pressed = true;
                lastKey = "w";
                background.position.y += 1;
            } else if (bolea.Tx && galopa) {
                keys.w.pressed = false;
                keys.s.pressed = false;
                lastKey = "";
                bolea.Tx = false;
            }
        };
        render();

        c.canvas.addEventListener("click", (event) => {
            click = {
                x: c.canvas.width / 2 - event.offsetX,
                y: c.canvas.height / 2 - event.offsetY,
            };
            let testar = { x: c.canvas.width / 2, y: c.canvas.height / 2 };
            if (event.offsetX < testar.x) {
                bolea.x = false;
                SumXY.Cx = background.position.x - click.x * -1;
                console.log("esquerda");
            } else {
                bolea.x = true;
                SumXY.Cx = background.position.x + click.x;
            }
            if (event.offsetY < testar.y) {
                bolea.y = false;
                SumXY.Cy = background.position.y - click.y * -1;
            } else {
                bolea.y = true;
                SumXY.Cy = background.position.y + click.y;
            }
        }); //click
    }); //onMount
    //script de click
</script>

<div id="desenho">
    <canvas bind:this={canvas} />
</div>

<style>
   
    #desenho {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height:100%;
        width: 100%;
    }
</style>
