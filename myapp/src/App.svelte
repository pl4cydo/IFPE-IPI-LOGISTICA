<script>
  import { onMount } from 'svelte';
  import collisions from './collisions'
  let canvas;

onMount(()=>{
  var click;
  var bolea = {x:false,y:false, Cx:false, Cy:false};
  canvas.width = 1000;
  canvas.height = 900;
  const context = canvas.getContext('2d');
  var valor = {x:0, y:0,s:0,m:0};
  
  class teste {
    constructor({position, velocity}){
      this.position = position;
      this.velocity = velocity; 
      this.width = 50
      this.height = 50
    }
    draw(){
      context.fillStyle = 'red'
      context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update(){
      this.draw();
      this.position.x = this.velocity.x
      this.position.y = this.velocity.y   
      
    }
    
  }
  
  class arrayColi{
    static largura (){
      return 44
    } 
    static altura (){
      return 44
    }
    constructor({position}){
      this.position = position
      this.altura = 44
      this.largura = 44
    }
    draw(){
      context.fillStyle = 'green'
      context.fillRect(this.position.x, this.position.y, this.largura, this.altura)
    }
  }

  const image = new Image()
  image.src = './Gameassets/map.png'
  
  const colisaoMapa = []
  for(let i = 0; i < collisions.length; i += 35){
    colisaoMapa.push(collisions.slice(i, 35 + i))
    console.log("a")
  }
  
  const guardColis = []
  colisaoMapa.forEach((linha, i) => {
    linha.forEach((sim, j) => {
      if(sim === 3)
      guardColis.push(
        new arrayColi ({
          position:{
            x:j * arrayColi.largura(),
            y:i * arrayColi.altura()
          }
        })
        )
      })
    })

    const player = new teste({
      position:{
        x:0,
        y:0
      },
      velocity:{
        x:0,
        y:0
      }
    });//escopo do player

   function animate(){
      window.requestAnimationFrame(animate)
      context.drawImage(image,-750,-200)
     guardColis.forEach(arrayColi => {
        arrayColi.draw()// xaray 176 y 528
      })

      if(player.velocity.x < valor.x && bolea.x == true && bolea.Cx == false){
        valor.s += 2
        player.velocity.x = valor.s
        
      }else if(valor.x < player.velocity.x && bolea.x == false && bolea.Cx == false){
        valor.s -= 2
        player.velocity.x = valor.s
      }
      
      if(player.velocity.y < valor.y && bolea.y == true && bolea.Cy == false){
        valor.m += 2
        player.velocity.y = valor.m
        
      }else if(valor.y < player.velocity.y && bolea.y == false && bolea.Cy == false){
        valor.m -= 2
        player.velocity.y = valor.m
      }
      player.update()
      colizaum()
    }
    
    animate()

    window.addEventListener('click', (e) =>{
      //bolea.Cx = false
      //bolea.Cy = false
    click = {x:e.pageX, y:e.pageY}

    if(click.x > canvas.width){
      valor.x = canvas.width - 50
    }
    else{
      valor.x = click.x

    }
    if(click.y > canvas.height){
      valor.y = canvas.height - 50
    }
    else{
      valor.y = click.y

    }

    if(player.velocity.x >= click.x){
	  bolea.x = false
    bolea.Cx = false
    console.log("esquerda")
	  }else{
	  bolea.x = true
  }
//teste eixo y de lado
	  if(player.velocity.y >= click.y){
	  bolea.y = false
    bolea.Cy = false
	  }else{
  	bolea.y = true
  }
    })//escopo do click

  function colizaum(){
    guardColis.forEach(arrayColi => {
        let quaXy = {Catx:player.position.x - arrayColi.position.x, Caty:player.position.y - arrayColi.position.y}
        let sumXy = {w:player.width + 50, h:player.height + 50}
        if(Math.abs(quaXy.Catx) < sumXy.w && Math.abs(quaXy.Caty) < sumXy.h ){
        let tudoX = (player.width + 50) - Math.abs(quaXy.Catx)
        let tudoY = (player.height + 50) - Math.abs(quaXy.Caty) 
        if (player.position.x < arrayColi.position.x + 50 &&
             player.position.x + player.width > arrayColi.position.x && bolea.Cx == false 
             && bolea.x == true) {
             console.log("colisao feita x")
             player.velocity.x = tudoX + 75
             bolea.Cx = true
    }
}
  })
}

})//escopo do onMount

</script>

<canvas
	bind:this={canvas}
></canvas>