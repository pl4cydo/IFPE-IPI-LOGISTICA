<script>
    import { walk, Nome } from "../stores";

    const chatHidden = () => {
        chatBox.style.display = "none";
        $walk = true;
    }

    const arrChat = [
        `Bem vindo, ${$Nome}, esse é o Dustry. (Use o mouse para clicar na seta e seguir)`,
        "O Dustry está em seu primeiro dia de trabalho em uma fábrica e precisa da sua ajuda.",
        "Siga o mapa em direção dos locais com uma placa escrito \"!\", nesses locais há tasks a serem feitas.",
        "Essas Tasks o ajudaram a entender melhor os processos Logisticos e de Segurança do Trabalho enquanto se diverte.",
        "Mas tenha atenção, permaneça nas areas seguras, destacadas em amarelo, para sua segurança.",
        "Divirta-se"
    ]
    let chatCount = 0;
    const chatLogic = () => {
        if(chatCount < arrChat.length - 1){
            chatCount++
        } else {
            chatHidden()
        }
    }


</script>

<div id="chatBox">
    <h1>{arrChat[chatCount]}</h1>
    <img src="./images/seta.gif" alt="seta" on:click={chatLogic}>
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
        top: 60%;
        right: 0;
        width: 7%;
        height: 40%;
        position: absolute;
        
    }
</style>