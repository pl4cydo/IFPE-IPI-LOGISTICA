<script>
    const nome = "Dustry"

    let check1 = ""
    let check2 = ""
    let check3 = ""

    // if() {
    //     check1 = "FEITO!"
    // }
    // if() {
    //     check2 = "FEITO!"
    // }
    // if() {
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
    <div id="check1">{check1}</div>
    <div id="check2">{check2}</div>
    <div id="check3">{check3}</div>
  </div>
</div>

<style>
  #infoBox {
    width: 18%;
    height: 30%;
    display: none;
    position: absolute;
    border: 1px solid black;
    top: 30%;
    left: 30%;
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
