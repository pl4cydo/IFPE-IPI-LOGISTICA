const context = document.getElementById('window').getContext('2d');
context.canvas.width = 800
context.canvas.height = 500
var click;
var bolea = { x: null, y: null, Tx: null}
var SumXY = { x: 0, y: 0, Cx: 0, Cy: 0 }

class repo {
 
    constructor({ position, velocity, image }) {
        this.position = position
        this.velocity = velocity
        this.image = image
    }
    update() {
        context.drawImage(this.image, this.position.x, this.position.y, context.canvas.width * 3, context.canvas.height * 1.95)
        this.move()
    }//2400 x 975
    move() {
        this.position.x = this.velocity.x
        this.position.y = this.velocity.y
    }
}

const mapJ = new Image()
mapJ.src = './mapa1.png'
const player = new Image()
player.src = './pikomon.png'
const map = new repo({
    position: {
        x: 0,
        y: 0
    }, velocity: {
        x: 0,
        y: 0
    },
    image: mapJ
})
const block = new repo({
    position: {
        x: 100,
        y: 60
    },
    velocity: {
        x: 0,
        y: 0
    }
})
var render = function () {
    window.requestAnimationFrame(render)
    map.update()
    context.drawImage(player, context.canvas.width / 2.45, context.canvas.height / 2, 80, 60)

    if (bolea.x == true && map.velocity.x > SumXY.Cx ) {//direita
        SumXY.x += 2 * (-1)
        map.velocity.x = SumXY.x
    }
    else if (bolea.x == false && map.velocity.x < SumXY.Cx ) {//esquerda
        SumXY.x -= 2 * (-1)
        map.velocity.x = SumXY.x
    } else {
        Tx = true
    }

    if (bolea.y == true && map.velocity.y > SumXY.Cy && Tx == true) {
        SumXY.y += 2 * (-1)
        map.velocity.y = SumXY.y
    }
    else if (bolea.y == false && map.velocity.y < SumXY.Cy && Tx == true) {
        SumXY.y -= 2 * (-1)
        map.velocity.y = SumXY.y
    } else {
        Tx = false
    }
    
}
render()

//window.addEventListener("resize", render);
context.canvas.addEventListener('click', (event) => {
    click = { x: (context.canvas.width / 2) - event.offsetX, y: (context.canvas.height / 2) - event.offsetY }
    let testar = { x: context.canvas.width / 2, y: context.canvas.height / 2 }

    if (event.offsetX < testar.x) {
        bolea.x = false
        SumXY.Cx = map.velocity.x - (click.x * (-1));
        console.log("esquerda")
    } else {
        bolea.x = true
        SumXY.Cx = map.velocity.x + click.x;
        console.log("direita")
    }
    if (event.offsetY < testar.y) {
        bolea.y = false
        SumXY.Cy = map.velocity.y - (click.y * (-1))
        console.log("cima")
    } else {
        bolea.y = true
        SumXY.Cy = map.velocity.y + click.y
        console.log("baixo")
    }
})
