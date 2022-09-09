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
    this.position.y += 10;
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
  
  function corno(){
    window.requestAnimationFrame(corno)
    Player.update();
  }
  corno()
})//iscopu onMount

</script>
<canvas
	bind:this={canvas}
	width={0}
	height={0}
></canvas>