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
    this.position.x += this.position.x
    this.position.y += this.position.y

  }
}

const Player = new teste({
    position:{
      x:0,
      y:0
    },
    velocity:{
      x:0,
      y:0
    }
  
  });//iscopu player
  document.addEventListener('click', pClick, true);
  function pClick(e){
    window.requestAnimationFrame(pClick)
    click = {x:e.pageX, y:e.pageY};
    console.log(click)
    if(Player.velocity.x >= click.x){
	    bolea.x = false
	}else{
	    bolea.x = true
}
//teste eixo y de lado
	if(Player.velocity.y >= click.y){
	    bolea.y = false
	}else{
	    bolea.y = true
}
//xxxx
    if(Player.velocity.x < click.x && bolea.x == true ){
		  Player.velocity.x = 5;

		 } else if(click.x < Player.velocity.x && bolea.x == false){
			 Player.velocity.x = -5;
		 }
//yyyyy
  if(Player.velocity.y < click.y && bolea.y == true){
			 Player.velocity.y = 5;
					 
		 }else if(click.y < Player.velocity.y && bolea.y == false){
			 Player.velocity.y = -5;	 
		 }
    Player.update();
    console.log("xxxx",Player.velocity.x,"YYY", Player.velocity.y)
  }
})//iscopu onMount

</script>
<canvas
	bind:this={canvas}
	width={0}
	height={0}
></canvas>