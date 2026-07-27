#!/usr/bin/env node
/* =====================================================================
   unlock-site.js — destranca as páginas para voltar a editar o site
   --------------------------------------------------------------------
   Uso:
     node tools/unlock-site.js --senha "MINHA-SENHA"

   Depois de editar, tranque de novo antes de publicar:
     node tools/lock-site.js --senha "MINHA-SENHA"
   ===================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PAGES, MARKER, root } = require("./gate-common.js");

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

const PAYLOAD_RE = /<script id="bsl-payload" type="application\/json">([\s\S]*?)<\/script>/;

function decrypt(payload, password) {
  const salt = Buffer.from(payload.s, "base64");
  const iv = Buffer.from(payload.i, "base64");
  const blob = Buffer.from(payload.c, "base64");
  /* WebCrypto guarda o tag de autenticação nos últimos 16 bytes. */
  const body = blob.subarray(0, blob.length - 16);
  const tag = blob.subarray(blob.length - 16);
  const key = crypto.pbkdf2Sync(password, salt, payload.it, 32, "sha256");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
}

function main() {
  const password = arg("--senha") || process.env.SITE_PASSWORD;
  if (!password) {
    console.error("Informe a senha:  node tools/unlock-site.js --senha \"MINHA-SENHA\"");
    process.exit(1);
  }

  let done = 0;
  for (const page of PAGES) {
    const file = path.join(root, page);
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    if (!html.includes(MARKER)) {
      console.log("  não estava trancado, ignorado:", page);
      continue;
    }
    const m = html.match(PAYLOAD_RE);
    if (!m) {
      console.error("  !! payload não encontrado em", page);
      process.exit(1);
    }
    let plain;
    try {
      plain = decrypt(JSON.parse(m[1]), password);
    } catch (e) {
      console.error("\nSenha incorreta (ou arquivo corrompido) em " + page + ". Nada foi alterado.");
      process.exit(1);
    }
    fs.writeFileSync(file, plain, "utf8");
    console.log("  destrancado:", page);
    done++;
  }
  console.log("\n" + done + " página(s) destrancada(s). Lembre de rodar lock-site.js antes de publicar.");
}

main();
