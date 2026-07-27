# Blue Senior Living — site trancado (pré-lançamento)

O site está criptografado até a abertura. Quem abre o endereço sem a senha vê
apenas uma tela de "Acesso restrito": o conteúdo real não existe em texto no
código-fonte, só como bloco cifrado (AES-256-GCM, chave derivada da senha por
PBKDF2-SHA256 com 600.000 iterações).

**A senha não está guardada neste repositório, de propósito.**

## Compartilhar acesso

1. **Link direto**, que abre sem digitar nada: `https://blueseniorliving.com.br/#k=SENHA`
   O trecho depois do `#` nunca é enviado ao servidor — fica só no navegador — e
   some da barra de endereço assim que a página abre.
2. **Digitando a senha** na tela de acesso.

Nos dois casos a senha vale só para aquela aba: navegar entre a home e o blog
não pede de novo, fechar o navegador sim.

## Editar o site

```bash
node tools/unlock-site.js --senha "A-SENHA"   # devolve o HTML normal + docs internos
# ... edite index.html, blog/*.html, privacidade.html ...
node tools/lock-site.js  --senha "A-SENHA"    # tranca de novo
git commit && git push                        # publica já trancado
```

Nunca dê `push` com as páginas destrancadas.

Para trocar a senha: destranque com a antiga e tranque com a nova.

## Estrutura

- `index.html`, `blog/`, `privacidade.html` — páginas (cifradas)
- `assets/` — CSS, JS, imagens e vídeo (**não** são cifrados; ver limites abaixo)
- `notes-src/` — documentação interna do projeto, cifrada (`.enc`)
- `tools/` — `lock-site.js`, `unlock-site.js`, `gate-common.js`, `build-blog.js`

## Limites conhecidos

O Render publica a raiz deste repositório e **não apaga arquivos removidos** em
deploys seguintes: por isso os caminhos antigos guardam textos-substitutos em vez
de simplesmente sumirem.

O que continua legível para quem souber o caminho exato do arquivo: `assets/`
(CSS, JS, imagens e vídeo). O texto do site, a documentação interna e o script
SQL estão cifrados. Como os caminhos das imagens só aparecem dentro do HTML
cifrado, eles não são descobríveis a partir do site — mas também não são
protegidos por senha.

## Na abertura (2027)

1. `node tools/unlock-site.js --senha "A-SENHA"`
2. `robots.txt`: trocar `Disallow: /` por `Allow: /` e voltar a apontar o sitemap.
3. Remover as metatags `noindex` das páginas e do template em `tools/build-blog.js`.
4. Recriar o `sitemap.xml` real e enviar ao Google Search Console.
