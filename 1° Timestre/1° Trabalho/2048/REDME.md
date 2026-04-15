# Projeto 2048 Web

Este projeto e um jogo 2048 feito para navegador, com visual personalizado, suporte a tema claro/escuro e controles para teclado, mouse e celular.

## O que foi usado para criar o site

### Estrutura e interface
- HTML5 para montar a pagina do jogo (cabecalho, placar, tabuleiro, botoes e overlay de estado).
- CSS3 para estilizar todo o layout, com:
	- variaveis CSS (cores e tema),
	- animacoes (loading, brilho da peca 2048, entrada e merge de pecas),
	- responsividade para telas menores.

### Logica e interacao
- JavaScript puro (sem framework) para:
	- logica completa do 2048,
	- movimentacao e fusao das pecas,
	- atualizacao de pontuacao,
	- deteccao de vitoria e game over,
	- leitura de teclado, arraste com mouse e swipe no touch.

### Recursos externos e armazenamento
- Google Fonts (fonte Poppins) para tipografia.
- LocalStorage do navegador para salvar:
	- melhor pontuacao (`2048bestScore`),
	- tema selecionado (`2048Theme`).

## Arquivos do projeto

- `2048.html`: pagina principal do jogo.
- `css/style.css`: estilos, temas, animacoes, layout e responsividade.
- `js/script.js`: controle de tema e tela de loading.
- `js/game.js`: motor do jogo (tabuleiro, regras, movimentos, score e estados).

## Como o site funciona

1. Ao abrir a pagina, aparece uma tela de carregamento animada.
2. O script aplica o tema salvo anteriormente (claro ou escuro).
3. O jogo inicializa um tabuleiro 4x4 e cria 2 pecas iniciais (2 ou 4).
4. O jogador move as pecas usando:
	 - setas do teclado,
	 - WASD,
	 - arrastar com mouse,
	 - swipe no celular.
5. A cada movimento valido:
	 - todas as pecas deslizam na direcao escolhida,
	 - pecas iguais que colidem se fundem,
	 - a pontuacao aumenta com o valor das fusoes,
	 - uma nova peca surge em uma posicao vazia.
6. Quando surge uma peca 2048, aparece mensagem de vitoria (com opcao de continuar).
7. Se nao houver movimentos possiveis, aparece Game Over.
8. O botao Nova Partida reinicia o estado do jogo.

## Regras principais do 2048 implementadas

- Tabuleiro de tamanho fixo 4x4.
- Cada movimento processa linhas/colunas na ordem correta da direcao.
- Uma peca so pode participar de uma fusao por movimento.
- Novas pecas aparecem com chance aproximada de:
	- 90% valor 2,
	- 10% valor 4.

## Diferenciais do projeto

- Toggle de tema claro/escuro com animacao customizada.
- Fundo animado com efeito visual de chuva.
- Overlay de estado para vitoria e derrota.
- Animacoes de entrada e merge das pecas para feedback visual.
- Melhor pontuacao persistente no navegador.

## Como executar

1. Abra o arquivo `2048.html` em um navegador.
2. Jogue normalmente com teclado, mouse ou touch.
3. Para desenvolvimento, edite os arquivos HTML, CSS e JS na pasta do projeto.

## Objetivo do jogo

Unir pecas de mesmo valor para chegar a peca **2048** e tentar bater sua melhor pontuacao.
