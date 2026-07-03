# POLIMENTO — Micro-interações do site Blue Senior Living

Auditoria e polimento de micro-interações para elevar a sensação premium, **sem tocar
em funcionalidade, estrutura de seções, copy aprovada ou na conexão com o Supabase do
app**. Todos os fluxos foram re-testados ao final (§4).

---

## 1. Vocabulário de movimento (um só, para o site inteiro)

Definido em tokens no `:root` de `assets/css/styles.css` e aplicado a todos os
componentes (landing e blog):

| Token | Valor | Uso |
|---|---|---|
| `--dur-fast` | **200ms** | micro: foco de inputs, células do calendário, chips de horário, links da nav |
| `--dur-base` | **250ms** | padrão: botões, cards, linhas de contato, sublinhado da nav, hovers |
| `--dur-slow` | **400ms** | entradas: reveals, fundo da navbar, mensagens de feedback, fade de imagens, FAB |
| `--ease` | `cubic-bezier(.25,.6,.25,1)` | ease-out sereno, único no site |

Regras seguidas:
- **Durações 200–400ms**, sempre ease-out. Delays de stagger no hero (80ms entre
  elementos) mantêm cada animação individual em 400ms.
- **Só `transform` e `opacity` animam** (auditados os 6 `@keyframes`: heroZoom,
  heroIn, scrollLine, spin, noteIn, fabPulse — todos compostáveis, zero layout/paint).
  Transições de cor/fundo existem apenas em hovers de estado (baratas, não animações).
- **`prefers-reduced-motion`**: tudo desliga (reveals, pulso, fades, vídeo pausa) e
  **nada fica oculto** — FAB e imagens visíveis de imediato.
- **Sem JS**: nenhum efeito esconde conteúdo (os gates `has-reveal`, `has-fab`,
  `has-imgfade` só entram no `<html>` via JS). O blog não carrega `main.js` — lá os
  gates nunca ativam e tudo é estático por padrão.

## 2. O que foi polido, item a item

1. **Reveal on scroll** — fade + `translateY(12px)` (antes 18px), 400ms, **uma vez
   só**, threshold generoso (4% + margem -5%): o conteúdo já está quase todo visível
   quando termina de entrar; nada "voa" de lado.
2. **Navbar** — ganho de fundo (transparente → papel) agora no token de 400ms;
   links com sublinhado que cresce da esquerda em 250ms (já existia; unificado).
3. **Botões e CTAs** — hover com **elevação sutil** (`translateY(-2px)`) + seta que
   desliza 3px; *pressed* volta a 0 em 200ms. O **primário** ganha um brilho celeste
   discreto no hover (`box-shadow` suave), como destaque de bom gosto.
4. **Cards e listas** — hover consistente em 250ms: posts do blog
   (`translateY(-3px)` + sombra suave — antes -4px com sombra pesada), imagens dos
   espaços (zoom 1.02 em 400ms — antes 1.035 em 1.4s), linhas dos pilares (título e
   número mudam de cor, sem deslocar o texto durante a leitura), linhas de contato
   (deslizam 10px).
5. **FAB do WhatsApp** — entra suave (fade + rise 400ms) **após ~200px de scroll**
   (antes: timer de 1,2s independente de scroll); **micro-pulso muito sutil e
   espaçado**: o ícone respira `scale(1.12)` por ~0,5s **a cada 7s**, só no ícone,
   nunca no botão inteiro. Sem JS: sempre visível. Com reduced-motion: visível, sem
   pulso.
6. **Formulários** — foco com anel celeste em 200ms (unificado); **mensagens de
   erro/sucesso/status surgem com fade + rise** (400ms) em vez de "pipocar";
   **loading inline no botão**: ao enviar, o botão mostra spinner + "Enviando…",
   trava reenvio e restaura sozinho (classe `is-loading`, lógica do scheduler
   intocada).
7. **Imagens** — fade-in de 400ms ao terminar de carregar (evita "pop"), via
   `html.has-imgfade` + `img.is-loaded`; imagens já em cache aparecem
   instantaneamente; `error` também resolve (nunca fica invisível).
8. **Consistência** — 12 durações diferentes viraram 3 tokens; raios, sombras e
   espaçamentos já unificados no redesign permanecem; blog alinhado ao mesmo
   vocabulário.
9. **Mobile** — animações leves (transform/opacity, IO once), nada intercepta o
   toque (`pointer-events` gerenciado no FAB oculto); **fluxo de agendamento
   completo testado em 390px com touch** (§4).

## 3. Performance

- Nenhuma biblioteca nova; +~40 linhas de CSS e +~45 de JS (IntersectionObserver e
  listeners passivos, `once` onde cabe).
- Animações apenas em propriedades compostáveis → sem reflow/repaint em scroll.
- O pulso do FAB anima somente o `<svg>` (elemento minúsculo) 1×/7s.
- Fade de imagens não atrasa o carregamento (só opacidade pós-load).
- Sem mudança em imagens/fonte/rede → Lighthouse inalterado na prática.

## 4. Verificação (Playwright/Chromium)

**33/33 aprovados** — com a resposta **real** da API de produção interceptada
(HTTP 200, 284 horários) e POST devolvido com 201 sem gravar no banco — inclui a checagem de que imagens lazy resolvem 5/5 ao rolar:

- **Agendamento desktop**: calendário renderiza a disponibilidade; máscara
  `(41) 99999-8888`; **loading inline** visível durante o envio (spinner + botão
  travado) e restauração após; payload `5541999998888` (DDI, só dígitos); mensagem
  aprovada ("Tudo certo, Maria!… não está confirmada"); horário vira "✓".
- **Agendamento mobile (390px, touch)**: fluxo completo repetido por toque —
  calendário → horário → formulário → máscara → envio → confirmação; WhatsApp
  direto ao lado; sem erros.
- **Micro-interações**: FAB oculto no topo e entrando após scroll; pulso armado;
  tokens 200/250/400ms computados; navbar em 400ms; botões em 250ms; hover eleva
  -2px; fade de imagens ativo com 100% resolvidas.
- **Reduced-motion**: FAB visível sem pulso, imagens/conteúdo 100% visíveis, vídeo
  pausado.
- **Blog** (3 posts, imagens visíveis sem gate), **Área do cliente**, **Trabalhe
  Conosco** (mailto + wa.me), **FAB → wa.me**.
- **Overflow zero** em 320/390/768/1281/1440 px. **Console limpo**.
