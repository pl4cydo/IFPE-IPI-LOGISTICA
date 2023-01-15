<script>

</script>

<div id="HeartBox">
    <div id="barLife">
        <div id="barGreen"></div>
    </div>
    <img src="./images/HeatBar.png" alt="fff">
</div>

<style>
    #HeartBox{
       position: absolute; 
       top: 6%;
       left: 50%;
       border: 1px solid blue;
       height: 15%;
       width: 50%;
       display: flex;
    }
    #HeartBox > img {
        width: 25%;
        position: absolute;
    }
    #barLife{
        position: absolute;
        top: 20%;
        left: 10%;
        border: 5px solid black;
        border-radius: 6px;
        height: 60%;
        width: 80%;
    }
    #barGreen{
        background-color: green;
        width: 100%;
        height: 100%;
    }
</style>