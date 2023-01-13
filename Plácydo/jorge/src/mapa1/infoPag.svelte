<script>
    import { infoTasks0 } from "../stores";

    const nome = "Dustry"
    
    // if($infoTasks.task1) {
    //     check2 = "FEITO!"
    // }
    // if($infoTasks.task2) {
    //     check3 = "FEITO!"
    // }

</script>

<div id="infoBox">
  <h3>INFO</h3>
  <div id="infoText">
    <p>Nome: {nome}</p>
    <p>Equipamento</p>
    <p>Recebimento</p>
    <p>Empinhadeira</p>
  </div>
  <div id="infoCheck">
    <div id="check1">{$infoTasks0}</div>
    <div id="check2"></div>
    <div id="check3"></div>
  </div>
</div>

<style>
  #infoBox {
    width: 40%;
    height: 50%;
    display: none;
    position: relative;
    border: 1px solid black;
    top: -22%;
    left: -28%;
    background-color: aliceblue;
    opacity: 0.8;
    font-size: 30px;
  }
  #infoBox > h3 {
    position: absolute;
    left: 41%;
  }
  #infoText {
    position: relative;
    /* border: 1px solid black; */
    top: 10%;
    margin: 1%;
    width: 55%;
    height: 85%;
  }
  #infoText > p {
    padding: 5%;
  }
  #infoCheck {
    top: 10%;
    position: relative;
    /* border: 1px solid black; */
    margin: 1%;
    width: 30%;
    height: 85%;
  }
  #infoCheck > div {
    position: relative;
    /* border: 1px solid black; */
    left: 0%;
  }
  #check1 {
    color: green;
    top: 25%;
  }
  #check2 {
    color: green;
    top: 34%;
  }
  #check3 {
    color: green;
    top: 42%;
  }
</style>
