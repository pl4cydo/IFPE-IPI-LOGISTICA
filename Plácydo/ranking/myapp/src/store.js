import { writable } from "svelte/store";

export const ranking = writable([])

ranking.subscribe(v => {
    const user = v.at(-1);

    if (!user) return;

    const formData = new FormData();
    formData.append('Nome', user.nome);
    formData.append('pontos', user.pontos);

    fetch('http://localhost:8001/adicionar.php', {
        method: 'post',
        body: formData
    }); // non blocking
})
