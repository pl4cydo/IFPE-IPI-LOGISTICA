<script>

</script>

<div id="HeartBox">
    <div id="barLife">
        <div id="barGreen"></div>
    </div>
    <img  src="./images/barra-de-vida.gif" alt="fff">
</div>

<style>
    #HeartBox{
        position: absolute; 
        top: 0;
        right: 0;
        height: 15%;
        width: 50%;
        display: flex;
    }
    #HeartBox > img {
        width: 100%;
        position: absolute;
    }
    #barLife{
        position: absolute;
        top: 40%;
        right: 0;
        border-radius: 6px;
        height: 60%;
        width: 80%;
    }
    #barGreen{
        background-color: rgb(78, 170, 2);
        width: 100%;
        height: 100%;
        transition: 0.5s ease;
    }
</style>