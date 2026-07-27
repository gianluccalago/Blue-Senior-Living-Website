#!/usr/bin/env node
/* =====================================================================
   lock-site.js — tranca o site atrás de uma senha (pré-lançamento)
   --------------------------------------------------------------------
   Cada página HTML é criptografada com AES-256-GCM (chave derivada da
   senha por PBKDF2-SHA256). O arquivo publicado passa a conter apenas
   um cadeado + o texto cifrado: sem a senha, nem o código-fonte revela
   o conteúdo.

   Uso:
     node tools/lock-site.js --senha "MINHA-SENHA"
     node tools/lock-site.js                 (gera uma senha forte)

   Para voltar a editar:
     node tools/unlock-site.js --senha "MINHA-SENHA"

   IMPORTANTE: guarde a senha. Sem ela o conteúdo só volta pelo
   histórico do git.
   ===================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PAGES, ITERATIONS, MARKER, root, gateHtml } = require("./gate-common.js");

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

/* Senha forte, mas ainda ditável por telefone: 4 grupos de 4. */
function generatePassword() {
  const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem I/O/0/1
  const bytes = crypto.randomBytes(16);
  let out = "";
  for (let i = 0; i < 16; i++) {
    if (i && i % 4 === 0) out += "-";
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

function encrypt(plaintext, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  /* WebCrypto espera o tag de autenticação concatenado ao final. */
  const payload = Buffer.concat([body, cipher.getAuthTag()]);
  return {
    s: salt.toString("base64"),
    i: iv.toString("base64"),
    c: payload.toString("base64"),
    it: ITERATIONS,
  };
}

/* Os documentos internos vivem dentro da pasta publicada (o Render serve a
   raiz do repositório), então também precisam virar texto cifrado. */
function lockNotes(password) {
  const dir = path.join(root, "notes-src");
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".enc")) continue;
    const file = path.join(dir, f);
    const enc = encrypt(fs.readFileSync(file, "utf8"), password);
    fs.writeFileSync(file + ".enc", JSON.stringify(enc), "utf8");
    fs.unlinkSync(file);
    console.log("  documento cifrado:", "notes-src/" + f);
    n++;
  }
  return n;
}

function main() {
  const password = arg("--senha") || process.env.SITE_PASSWORD || generatePassword();
  const generated = !arg("--senha") && !process.env.SITE_PASSWORD;

  let locked = 0;
  let skipped = 0;

  for (const page of PAGES) {
    const file = path.join(root, page);
    if (!fs.existsSync(file)) {
      console.log("  ausente, ignorado:", page);
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    if (html.includes(MARKER)) {
      console.log("  já trancado, ignorado:", page);
      skipped++;
      continue;
    }
    const depth = page.split("/").length - 1;
    const base = "../".repeat(depth);
    fs.writeFileSync(file, gateHtml(encrypt(html, password), base), "utf8");
    console.log("  trancado:", page);
    locked++;
  }

  const notes = lockNotes(password);

  console.log("\n" + locked + " página(s) trancada(s)" + (skipped ? ", " + skipped + " já estavam" : "") +
    (notes ? " e " + notes + " documento(s) interno(s) cifrado(s)" : "") + ".");
  if (generated) {
    console.log("\n  SENHA GERADA: " + password);
    console.log("  Guarde-a agora — ela não fica salva em lugar nenhum.");
  }
  console.log("\n  Link direto (abre sem digitar a senha):");
  console.log("  https://blueseniorliving.com.br/#k=" + encodeURIComponent(password));
}

main();
