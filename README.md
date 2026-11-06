# Site do Studio Day Lima

Oi! Este é o site do Studio Day Lima. Este arquivo explica o que você precisa fazer para deixar tudo pronto, e o que ficou de fora e por quê.

---

## 1. O que você precisa fazer

Estas coisas são do jeito de exemplo e precisam ser trocadas pelas reais.

**Telefone do WhatsApp**
Em vários lugares do `index.html` aparece o número `5511999999999`. Troque pelo número verdadeiro do salão. Dica: use o "Localizar e substituir" do VS Code (Ctrl+H) para trocar todos de uma vez.

**Endereço e horário**
Aparece "Rua Exemplo, 000". Troque pelo endereço de verdade, e confira se o horário (seg a sex 9h às 19h, sáb 9h às 16h) está certo.

**Mapa**
O mapa mostra só "Suzano SP". Se quiser o mapa exato do salão, abra o Google Maps, procure o salão, clique em "Compartilhar" e depois em "Incorporar um mapa". Copie o link `src` e troque no `index.html`.

**Link do Instagram**
O botão "Ver mais no Instagram" leva para `instagram.com/`. Coloque o endereço do perfil do salão.

**Depoimentos**
Os nomes "Cliente 1", "Cliente 2" e assim por diante são exemplos. Troque pelos depoimentos reais das clientes, mas só com permissão delas. Os textos ficam dentro do `script.js`, na parte que começa com `REVIEWS`.

**Ícone do Google nos depoimentos**
Os cards têm o logo do Google e escrevem "Avaliação no Google". Isso só pode ficar se as avaliações forem mesmo do Google. Se não forem, tire o ícone e troque a frase.

**Spa dos pés (foto)**
O serviço de spa dos pés ainda não tem foto. Aparece um bloco bege no lugar. Quando tiver as fotos, coloque-as na pasta `img/` e troque o bloco.

**Foto das mesas na hero (opcional)**
A Lívia pediu uma foto das mesas com blur no fundo da primeira parte do site. Hoje o fundo é a fachada. Se quiser a foto das mesas, é só trocar o nome do arquivo na linha `hero-bg` do `style.css`.

**Fotos em HEIC**
Muitas fotos originais estão no formato HEIC (formato de iPhone). O computador onde o site foi feito não consegue abrir esse formato. Para usar essas fotos, abra cada uma no celular ou no computador e salve como JPG. Depois me mande que eu coloco no site.

**Fotos de esmaltação e da galeria**
Algumas fotos que a Lívia mandou (esmalte azul, vermelho, mão com anel) estavam em HEIC. Se você exportar como JPG, elas podem entrar na galeria e na esmaltação.

**Tipografia (fontes)**
Nos prints não aparecem os nomes das fontes, tamanhos ou pesos de cada seção. Hoje o site usa Georgia nos títulos e uma fonte sem serifa nos textos. Se a Lívia tiver as fontes escolhidas, mande o nome delas para trocar no `style.css`.

**Testar o site**
No VS Code, abra a pasta `studio-day-lima` inteira e clique com o botão direito em `index.html` > "Open with Live Server". Confira se todas as fotos aparecem e se os textos estão certos.

---

## 2. O que ficou de fora e por quê

**Fotos em HEIC (17 arquivos)**
O computador usado para montar o site não consegue abrir esse formato. Por isso elas ficaram de fora. Ver o passo "Fotos em HEIC" acima.

**Fotos que estavam só nos prints do WhatsApp**
Os prints têm a tela do celular por cima e baixa qualidade. Eles não servem para o site, então não foram usados. Só foram usadas as fotos originais que estão no Drive.

**Foto das mesas (blur do fundo)**
Não foi enviada. Por isso o fundo da hero usa a fachada.

**Fotos de referência da internet (Pinterest, Instagram de outros salões)**
A Lívia mandou várias fotos de modelos de unhas que não são do salão. Elas não foram usadas, porque podem ter direitos de imagem de outras pessoas. Para o site real, o ideal é usar fotos dos trabalhos do próprio salão.

**Seção "Trabalhe conosco"**
Ela continua no site, mas no meio da página. Foi deixada ali para você decidir se quer mudar de lugar. Ela pode ir para o final, antes do rodapé.

**Tipografias específicas**
Não encontrei nos prints os nomes das fontes de cada seção. Por isso o site continua com as fontes padrão.

---

## 3. Arquivos do projeto

- `index.html`: a estrutura do site (o que aparece e onde).
- `style.css`: as cores, tamanhos e efeitos visuais.
- `script.js`: as coisas que se mexem sozinhas (carrosséis, menu, tema claro/escuro, depoimentos).
- `img/`: todas as fotos usadas no site. Não apague nem mude os nomes delas, senão o site não encontra a imagem.
- `README.md`: este arquivo.

**Regra de ouro:** mantenha a pasta `img/` do lado do `index.html`. Se ela ficar em outro lugar, as fotos não aparecem.

---

## 4. Painel do site (admin)

Agora o site tem um painel para trocar os textos sem mexer no código.

**Como entrar**
1. Abra o arquivo `admin.html` no navegador (com o Live Server, ou no site publicado, acrescentando `/admin.html` no fim do endereço).
2. A senha inicial é **studio2026**.

**Como trocar um texto**
1. Entre no painel e mude o que quiser: WhatsApp, endereço, horários, textos do topo, valores, sobre nós e depoimentos.
2. Clique em **Baixar content.js**. Um arquivo novo é baixado.
3. Substitua o arquivo `content.js` antigo da pasta do projeto pelo que você baixou, e envie a pasta atualizada para onde o site está publicado.
4. Atualize a página do site.

**Regras importantes**
- Os campos do WhatsApp só aceitam números. Use o formato 55 + DDD + número, por exemplo `5511976652392`.
- Depoimentos só com permissão das clientes.
- O painel é uma proteção simples. Qualquer pessoa que veja o código-fonte consegue descobrir a senha. Para uma proteção de verdade, seria preciso um serviço com login (por exemplo, o Decap CMS com login do GitHub). Se quiser, posso montar essa versão.

**Arquivos ligados ao painel**
- `admin.html`: o painel.
- `content.js`: todos os textos editáveis. Só altere por meio do painel.
- `cms.js`: aplica os textos de `content.js` no site. Não precisa mexer.
