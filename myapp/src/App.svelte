<script>
import { onMount } from 'svelte';
let canvas;

onMount(()=>{
  var click;
  var bolea = {x:false,y:false};
  canvas.width = 500;
  canvas.height = 500;
  const c = canvas.getContext('2d');
  c.fillRect(0,0, canvas.width, canvas.height);
  var valor = {x:0, y:0,s:0,m:0};

  class teste {
    constructor({position, velocity}){
    this.position = position;
    this.velocity = velocity;
    }

   draw(){
    c.fillStyle = 'red'
    c.fillRect(this.position.x, this.position.y, 50, 50)
   }
    update(){
    this.draw();

    this.position.x = this.velocity.x
    this.position.y = this.velocity.y
   
    }

  }
  const player = new teste({
      position:{
        x:0,
        y:0
      },
      velocity:{
        x:0,
        y:0
      }
    
    });//iscopu player

   function animate(){
      window.requestAnimationFrame(animate)
      c.fillStyle = 'black'
      c.fillRect(0, 0, canvas.width, canvas.height)

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
    valor.x = click.x
    valor.y = click.y

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
    })


})//iscopu onMount



</script>
<canvas
	bind:this={canvas}
	width={0}
	height={0}
></canvas>