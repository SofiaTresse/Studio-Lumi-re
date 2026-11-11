# Studio Lumière — site de salão de beleza

Site estático (HTML, CSS e JavaScript) para um studio de cabelo, com visual editorial em tons de creme, dourado e preto. Totalmente responsivo, sem frameworks e sem dependências de build.

## Como visualizar

Abra o arquivo `index.html` no navegador ou rode um servidor local na pasta do projeto:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Estrutura

```
.
├── index.html          # página completa (hero, serviços, sobre, galeria, depoimentos, agendamento, contato)
├── css/
│   └── style.css       # identidade visual, layout e responsividade
├── js/
│   └── main.js         # menu, animações, carrossel, lightbox, validação e WhatsApp
└── assets/
    ├── favicon.svg
    └── img/            # imagens do site (Unsplash)
```

## O que já está funcionando

- Menu fixo com versão mobile em tela cheia (fecha com `Esc` e trava o fundo).
- Animações suaves de entrada ao rolar, com respeito a `prefers-reduced-motion`.
- Contadores animados na seção “Sobre”.
- Galeria com lightbox acessível (abre ao clicar, fecha com `Esc` ou no fundo).
- Carrossel de depoimentos com setas, indicadores e rotação automática (pausa ao passar o mouse ou focar).
- Botões “Reservar” dos serviços que já pré-selecionam o serviço no formulário.
- Agendamento validado no navegador:
  - nome, WhatsApp com máscara e DDD, serviço, data e horário;
  - datas passadas e domingos bloqueados;
  - horários de sábado limitados a 17h30;
  - resumo do pedido e envio pelo WhatsApp com a mensagem pronta.
- Link flutuante de WhatsApp e ano do rodapé automático.

> O formulário não depende de backend: ao final, ele monta a mensagem e abre o WhatsApp. Para confirmação automática de horários, será necessário integrar uma API.

## Personalização rápida

- **WhatsApp:** troque o número em `js/main.js` na constante `WHATSAPP` (formato `55DDDNUMERO`) e também nos links `https://wa.me/...` do `index.html`.
- **Cores e fontes:** edite as variáveis no topo de `css/style.css` (`:root`).
- **Serviços, preços e textos:** direto no `index.html`.
- **Endereço, telefone e horários:** no bloco de agendamento e no rodapé.
- **Imagens:** substitua os arquivos em `assets/img/` mantendo os mesmos nomes.

## Observação sobre conteúdo

Nome do studio, endereço, telefones, preços, avaliações e depoimentos são **fictícios**, usados como ponto de partida. As fotos são do [Unsplash](https://unsplash.com/) e podem ser trocadas pelas imagens reais do salão.

## Próximos passos sugeridos

1. Substituir os dados fictícios e as fotos pelos reais.
2. Integrar o formulário a um backend, Google Calendar ou serviço de agendamento.
3. Adicionar mapa incorporado e link real de localização.
4. Incluir política de privacidade e aviso de cookies, se necessário.
5. Otimizar imagens (WebP/AVIF) e publicar em um serviço de hospedagem estática.
