<script>
  import { onMount } from 'svelte';
  import collisions from './collisions'
let canvas;

onMount(()=>{
  var click;
  var bolea = {x:false,y:false, o:false};
  canvas.width = 1080;
  canvas.height = 900;
  const context = canvas.getContext('2d');
  var valor = {x:0, y:0,s:0,m:0};
 

  class teste {
    
    constructor({position, velocity}){
    this.position = position;
    this.velocity = velocity;
    
    }

   draw(){
    context.fillStyle = 'red'
    context.fillRect(this.position.x, this.position.y, 50,50)
    
   }
    update(){
    this.draw();
    this.position.x = this.velocity.x
    this.position.y = this.velocity.y
   
    }

  }
 
  class outro{
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
    drau(){
      context.fillStyle = 'green'
      context.fillRect(this.position.x, this.position.y, this.largura, this.altura)
    }
  }

  const colisaoMapa = []
  for(let i = 0; i < collisions.length; i += 35){
    colisaoMapa.push(collisions.slice(i, 35 + i))
  }
  
  const guardColis = []
  colisaoMapa.forEach((linha, i) => {
    linha.forEach((sim, j) => {
      if(sim === 3)
      guardColis.push(
        new outro ({
          position:{
            x:j * outro.largura(),
            y:i * outro.altura()
          }
        })
      )
    })
  })

  const image = new Image()
  image.src = './Gameassets/map.png'

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
      guardColis.forEach(outro => {
        outro.drau()
      })

      if(player.velocity.x < valor.x && bolea.x == true){
        valor.s += 2
        player.velocity.x = valor.s
        
      }else if(valor.x < player.velocity.x && bolea.x == false){
        valor.s -= 2
        player.velocity.x = valor.s
      }
      
      if(player.velocity.y < valor.y && bolea.y == true){
        valor.m += 2
        player.velocity.y = valor.m
        
      }else if(valor.y < player.velocity.y && bolea.y == false){
        valor.m -= 2
        player.velocity.y = valor.m
      }
      player.update()
    }
    
    animate()

    window.addEventListener('click', (e) =>{
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
	  console.log("Xmaior ou igual")
	  }else{
	  bolea.x = true
	  console.log("Xmenor ou igual")
  }
//teste eixo y de lado
	  if(player.velocity.y >= click.y){
	  bolea.y = false
	  console.log("Ymaior ou igual")
	  }else{
  	bolea.y = true
	  console.log("Ymenor ou igual")
  }
    })//escopo do click


})//escopo do onMount

function barrar(){

}

</script>
<canvas
	bind:this={canvas}
	width={0}
	height={0}
></canvas>