<script>
    import { infoTasks0, infoTasks1, infoTasks2 } from "../stores";
    import { Nome } from "../stores";
    import { totalPoints } from "../stores";
    
    // if($infoTasks.task1) {
    //     check2 = "FEITO!"
    // }
    // if($infoTasks.task2) {
    //     check3 = "FEITO!"
    // }

</script>

<div id="infoBox">
  <div class="info-tittle">
    <h1>INFO</h1>
  </div>
  <div id="info-text">
    <div class="info-item">
      <h2>Nome: {$Nome === "" ? "Dustry" : $Nome}</h2>
    </div>

    <div class="info-item">
      <h2>Equipamento</h2> <h2 class="task-progress" class:finalizada={$infoTasks0 === "COMPLETO!"} class:nao={$infoTasks0 === "INCOMPLETO!"}>{$infoTasks0}</h2>
    </div>

    <div class="info-item">
      <h2>Recebimento</h2> <h2 class="task-progress" class:finalizada={$infoTasks1 === "COMPLETO!"} class:nao={$infoTasks1 === "INCOMPLETO!"} >{$infoTasks1}</h2>
    </div>

    <div class="info-item">
      <h2>Empilhadeira</h2> <h2 class="task-progress" class:finalizada={$infoTasks2 === "COMPLETO!"} class:nao={$infoTasks2 === "INCOMPLETO!"}>{$infoTasks2}</h2>
    </div>

    <div class="info-item">
      <h2>Pontuação</h2> <h2 class="task-progress">{$totalPoints}</h2>
    </div>

  </div>
  
</div>

<style>
  #infoBox {
    top: 2%;
    right: 1%;
    width: 40%;
    display: none;
    flex-flow: column nowrap;
    position: absolute;
    border: 2px ridge black;
    background: white;
  
  }
  .info-tittle{
    color: black;
    width: 100%;
    font-size: 1.5em;
    text-align: center;
  }
  #info-text{
    width: 100%;
  }
  .info-item{
    display: flex;
    justify-content: space-between;
    color: black ;
    padding: 2%;
    margin-bottom: 2%;
    letter-spacing: 1px;
  }
  .task-progress{
    text-align: end;
  }
  .finalizada{
    color: green;
  }
  .nao{
    color: red;
  }
  .info-item > h2{
    width: 100%;
    border-bottom: solid 2px black;
  }
 
</style>
