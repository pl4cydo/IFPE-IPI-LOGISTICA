# Dustry

---

# Projeto interdisciplinar entre o curso de Informática para Internet e Logística do Instituto Federal de Educação, Ciência e Tecnologia de Pernambuco - Campus Igarassu.

Esse projeto tem o objetivo de criar um jogo instrutivo para ensinar a novos trabalhadores em ambiente fabril, a compreender conceitos Logísticos e de Segurança do Trabalho.

Breve história: Esse projeto é uma continuação do [Projeto RPG](https://github.com/pl4cydo/IFPE-projeto-svelte--RPG) (Projeto de conclusão do primeiro período), sendo solicitado pelo Docente Tarcísio Magalhães (Logística), sua ideia é disponibilizar o jogo em industrias pernambucanas e também torná-lo uma extensão.

Os colaboradores foram [Anthony Richards](https://github.com/aR1ch4rdz), [Arley Nunes](https://github.com/Arluzss) e [Plácydo Lima](https://github.com/pl4cydo), com a supervisão dos professores Tarcísio Magalhães, Leandro e [Allam Lima](https://github.com/allan-diego).

Para mais informações sobre o processo de criação, reuniões, esboços e tecnologias usadas além do Svelte, PHP e MySQL veja o [GDD](./Documentacao/GDD-Dustry.pdf) (Game Disign Document) do projeto.

Após o tópico inicial segue a explicação de como testar e usar o jogo.

## Dustry
#### Tela Incial
![](./0 - Principal/Imgs/inicio.png)

#### Game
![](./0 - Principal/Imgs/game.png)

#### Mapa
![](./0 - Principal/Imgs/mapa.png)

#### Epi
![](./0 - Principal/Imgs/epi.png)


#### Tasks
![](./0 - Principal/Imgs/taks.png)

#### Empilhadeira
![](./0 - Principal/Imgs/empilhadeira.png)



## Para Jogar
*Para iniciar o Svelte você precisa ter o [nodejs](https://nodejs.org/en/) instalado.*

Siga os comandos a baixo para iniciar o front do jogo...

```bash
cd IFPE-IPI-LOGISTICA/0 - Principal/Final
npm install
```

...Para iniciar use o comando a baixo:

```bash
npm run dev
```

Navegue até o  [localhost:8080](http://localhost:8080). Nesse local você vera o projeto funcionando em faze de teste.

## Back
O jogo contem algumas funcionalidades que precisam de mais que o front-end. Como é o caso do Ranking, que precisa de uma simples API em PHP, que se conecta a um banco MySQL, para funcionar.

*Você precisa ter o [PHP](https://www.php.net/downloads.php) e o [MySQL](https://www.mysql.com/downloads/) instalado.*

Para o back-end siga esses comados:

```bash
cd IFPE-IPI-LOGISTICA/0 - Principal/Final/Backend-php
php -S localhost:8001
```

*Também é importante entrar o arquivo de conexão e colocar o usuário e senha do seu cliente MySQL*

### MySQL
Crie siga esses comandos dentro do cliente:
```bash	
CREATE DATABASE projeto_logistica;
USE projeto_logistica;
CREATE TABLE ranking(
	Nome varchar(255),
	pontos int,
	primary key(Nome)
);
```
Com isso o banco ira fornecer um local para salvar o nome e os pontos do jogador.

## Single-page app mode

By default, sirv will only respond to requests that match files in `public`. This is to maximise compatibility with static fileservers, allowing you to deploy your app anywhere.

If you're building a single-page app (SPA) with multiple routes, sirv needs to be able to respond to requests for *any* path. You can make it so by editing the `"start"` command in package.json:

```js
"start": "sirv public --single"
```

## Using TypeScript

This template comes with a script to set up a TypeScript development environment, you can run it immediately after cloning the template with:

```bash
node scripts/setupTypeScript.js
```

Or remove the script via:

```bash
rm scripts/setupTypeScript.js
```

If you want to use `baseUrl` or `path` aliases within your `tsconfig`, you need to set up `@rollup/plugin-alias` to tell Rollup to resolve the aliases. For more info, see [this StackOverflow question](https://stackoverflow.com/questions/63427935/setup-tsconfig-path-in-svelte).

## Deploying to the web

### With [Vercel](https://vercel.com)

Install `vercel` if you haven't already:

```bash
npm install -g vercel
```

Then, from within your project folder:

```bash
cd public
vercel deploy --name my-project
```

### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
npm install -g surge
```

Then, from within your project folder:

```bash
npm run build
surge public my-project.surge.sh
```
