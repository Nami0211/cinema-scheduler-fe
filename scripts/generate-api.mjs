import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Carica variabili d'ambiente da .env (fallback)
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      envFile.split('\n').forEach(line => {
        const match = line.match(/^([^#\s]+)=(.*)$/);
        if (match) {
          if (!process.env[match[1]]) {
            process.env[match[1]] = match[2].trim();
          }
        }
      });
    }
  } catch (e) {
    // ignore
  }
}

loadEnv();

const defaultSpecPath = path.resolve(process.cwd(), 'mocks/openapi-reference.json');
let specUrl = process.env.OPENAPI_SPEC_URL;

async function checkAndDownloadSpec(url) {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    try {
      console.log(`Verifica raggiungibilita' backend all'indirizzo: ${url}...`);
      // AbortController per timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!res.ok) {
        throw new Error(`HTTP Status ${res.status}`);
      }
      return url;
    } catch (error) {
      console.error(`\n[ERRORE] Il backend non e' raggiungibile all'indirizzo configurato: ${url}`);
      console.error(`Dettagli errore: ${error.message}`);
      console.error(`Assicurati che il backend sia in esecuzione (es. localhost:3001), oppure rimuovi/commenta OPENAPI_SPEC_URL dal file .env per usare il mock di default.\n`);
      process.exit(1);
    }
  } else if (url) {
    if (!fs.existsSync(path.resolve(process.cwd(), url))) {
      console.error(`\n[ERRORE] File spec OpenAPI non trovato: ${url}\n`);
      process.exit(1);
    }
    return url;
  }
  
  console.log(`Nessun OPENAPI_SPEC_URL configurato (o vuoto).`);
  console.log(`Utilizzo lo spec di riferimento locale: ${defaultSpecPath}`);
  return defaultSpecPath;
}

async function run() {
  const finalSpecSource = await checkAndDownloadSpec(specUrl);
  const outputDir = 'src/api-client';
  
  console.log(`Generazione del client API in ${outputDir}...`);
  
  try {
    execSync(
      `npx openapi-generator-cli generate -i "${finalSpecSource}" -g typescript-fetch -o ${outputDir} --additional-properties=typescriptThreePlus=true,supportsES6=true`,
      { stdio: 'inherit' }
    );
    console.log(`\nClient API generato con successo in ${outputDir}!`);
  } catch (error) {
    console.error(`\n[ERRORE] Impossibile completare la generazione del client API.`);
    process.exit(1);
  }
}

run();
