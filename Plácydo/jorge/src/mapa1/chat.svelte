<script>
    import { walk } from "../stores";

    const chatHidden = () => {
        chatBox.style.display = "none";
        $walk = true;
    }
</script>

<div id="chatBox">
    <h1>“Eu não conheço metade de vocês como gostaria; e gosto de menos da metade de vocês a metade do que vocês merecem.” Bilbo</h1>
    <img src="./images/seta.gif" alt="seta" on:click={chatHidden}>
</div>

<style>
    #chatBox{
        border: 2px solid orangered;
        background-color: whitesmoke;
        display: flex;
        height: 25%;
        width: 100%;
        top: 37.5%;
        position: relative;
    }
    #chatBox > h1 {
        margin: 2%;
    }
    #chatBox > img {
        position: absolute;
        left: 83%;
    }
</style>