# Site trancado — pré-lançamento

O site está criptografado até a abertura. Quem abre `blueseniorliving.com.br`
sem a senha vê apenas uma tela de "Acesso restrito": o conteúdo real nem sequer
existe em texto no código-fonte, só como bloco cifrado (AES-256-GCM, chave
derivada da senha por PBKDF2-SHA256 com 600.000 iterações).

**A senha não está guardada neste repositório, de propósito.** Sem ela, o
conteúdo só volta pelo histórico do git.

## Compartilhar acesso

Dois jeitos:

1. **Link direto** (não precisa digitar nada):
   `https://blueseniorliving.com.br/#k=SENHA`
   O trecho depois do `#` nunca é enviado ao servidor; fica só no navegador.
   Ao abrir, a senha some da barra de endereço.
2. **Digitando a senha** na própria tela de acesso.

Em ambos os casos a senha fica guardada só naquela aba (`sessionStorage`):
navegar entre a home e o blog não pede a senha de novo, mas fechar o navegador
sim.

## Editar o site depois

```bash
node tools/unlock-site.js --senha "A-SENHA"   # devolve o HTML normal
# ... edite index.html, blog/*.html, privacidade.html ...
node tools/lock-site.js  --senha "A-SENHA"    # tranca de novo
git commit && git push                        # publica já trancado
```

Nunca dê `push` com as páginas destrancadas — é isso que mantém o conteúdo
fora do alcance de quem não tem a senha.

## Trocar a senha

```bash
node tools/unlock-site.js --senha "SENHA-ANTIGA"
node tools/lock-site.js  --senha "SENHA-NOVA"
```

## Na hora de abrir (2027)

1. `node tools/unlock-site.js --senha "A-SENHA"`
2. Em `robots.txt`, trocar `Disallow: /` por `Allow: /` e voltar a apontar o sitemap.
3. Remover as metatags `noindex` das páginas e do template em `tools/build-blog.js`.
4. Recriar o `sitemap.xml` e enviar ao Google Search Console.
