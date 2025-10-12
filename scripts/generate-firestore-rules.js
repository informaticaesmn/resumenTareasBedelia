#!/usr/bin/env node
// scripts/generate-firestore-rules.js
// Lee whitelist.json (o whitelist.example.json) y genera generated-firestore.rules
// para copiar y pegar en Firebase Console -> Firestore -> Rules
// se ejecuta con "npm run gen-rules"

import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const whitelistPath = path.join(cwd, 'whitelist.json');
const examplePath = path.join(cwd, 'whitelist.example.json');

let emails = [];
if (fs.existsSync(whitelistPath)) {
  emails = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
} else if (fs.existsSync(examplePath)) {
  emails = JSON.parse(fs.readFileSync(examplePath, 'utf8'));
  console.warn('Usando whitelist.example.json. Crea whitelist.json para editar la lista real.');
} else {
  console.error('No se encontró whitelist.json ni whitelist.example.json. Crea uno con la lista de emails.');
  process.exit(1);
}

if (!Array.isArray(emails)) {
  console.error('El archivo whitelist debe ser un array de strings (emails).');
  process.exit(1);
}

const escapedEmails = emails.map(e => e.replace(/\\/g, '\\\\').replace(/'/g, "\\'"));

const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAllowedEmail() {
      return request.auth != null && (
        ${escapedEmails.map(e => `request.auth.token.email == '${e}'`).join(' ||\n        ')}
      );
    }

    match /{document=**} {
      allow read: if isAllowedEmail();
      allow write: if false;
    }
  }
}
`;

const outPath = path.join(cwd, 'generated-firestore.rules');
fs.writeFileSync(outPath, rules, 'utf8');
console.log('Reglas generadas en', outPath);
console.log('Pégalas en Firebase Console -> Firestore -> Rules y publícalas.');
