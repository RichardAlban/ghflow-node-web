1) Preparación del repositorio

Crea un repo vacío en GitHub, por ejemplo, ghflow-node-web.

Clona y entra a la carpeta:
git clone https://github.com/<tu-usuario>/ghflow-node-web.git
cd ghflow-node-web
2) Estructura base + código mínimo
2.1. Crear carpetas
mkdir -p src public .github/workflows
2.2. package.json
Crea el archivo package.json con este contenido:
{
  "name": "ghflow-node-web",
  "version": "1.0.0",
  "description": "Demo GitHub Flow con Node, Express, CI y web simple",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --runInBand"
  },
  "license": "MIT",
  "dependencies": {
    "express": "^4.19.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "nodemon": "^3.1.0"
  }
}
Instala dependencias y genera package-lock.json:
npm install
2.3. Servidor Express
src/app.js
const express = require('express');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir estáticos desde /public
app.use(express.static(path.join(__dirname, '../public'))); // express.static, doc oficial.

// Endpoint mínimo de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
src/server.js
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor listo: http://localhost:${PORT}`);
});
2.4. Web simple

public/index.html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Demo Node + Express</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; }
      .card { border: 1px solid #ddd; padding: 1rem; border-radius: .5rem; max-width: 640px; }
      a.button { display: inline-block; padding: .5rem .75rem; border: 1px solid #333; border-radius: .5rem; text-decoration: none; }
    </style>
  </head>
  <body>
    <h1>Bienvenido 👋</h1>
    <div class="card">
      <p>Esta es una página estática servida por Express.</p>
      <p>
        <a class="button" href="/contact.html">Ir al formulario de contacto</a>
      </p>
      <p id="status"></p>
    </div>

    <script>
      // Solo para comprobar que el backend responde:
      fetch('/api/health')
        .then(r => r.json())
        .then(d => document.getElementById('status').textContent = 'API status: ' + d.status)
        .catch(() => document.getElementById('status').textContent = 'API no disponible');
    </script>
  </body>
</html>
2.5. Tests iniciales

Crea la carpeta __tests__ y el archivo:

__tests__/health.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Health endpoint', () => {
  it('GET /api/health → 200 {status:"ok"}', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
2.6. GitHub Actions (CI)

.github/workflows/ci.yml
name: ci

on:
  push:
    branches: [ "main", "feat/**", "feature/**" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'
      - run: npm ci
      - run: npm test
2.7. .gitignore

.gitignore
node_modules/
coverage/
.env
2.8. Primer commit y push
git add .
git commit -m "chore: bootstrap Node/Express app, static page, tests and CI"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/ghflow-node-web.git
git push -u origin main
3) Protege main y exige checks

En GitHub: Settings → Branches → Add branch protection rule:

Branch name pattern: main

Marca Require a pull request before merging y Require status checks to pass before merging.
4) Flujo práctico: issue → branch → PR (con cambios reales)
4.1. Crea un issue

Título: Formulario de contacto (UI + endpoint + tests)

Descripción:

Crear /public/contact.html con formulario (nombre, email, mensaje).

Endpoint POST /api/contact que valide campos y devuelva {id,...}.

Tests con Supertest (201 para válido, 400 si faltan campos).

Cierra el issue automáticamente con fixes #<número> en el PR.
4.2. Crea la rama de trabajo
git switch -c feat/contact-form
4.3. Implementa la página de contacto y el endpoint
public/contact.html (nuevo archivo)
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Contacto</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; }
      form { max-width: 520px; display: grid; gap: .75rem; }
      input, textarea, button { padding: .5rem; font-size: 1rem; }
      .ok { color: #0a0; }
      .err { color: #a00; }
    </style>
  </head>
  <body>
    <h1>Contacto</h1>
    <form id="f">
      <input name="name" placeholder="Tu nombre" required />
      <input name="email" type="email" placeholder="Tu email" required />
      <textarea name="message" placeholder="Mensaje" required></textarea>
      <button>Enviar</button>
      <p id="msg"></p>
    </form>

    <p><a href="/">Volver</a></p>

    <script>
      const f = document.getElementById('f');
      const msg = document.getElementById('msg');
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.textContent = 'Enviando...';
        const formData = new FormData(f);
        const payload = Object.fromEntries(formData.entries());
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          msg.className = 'ok';
          msg.textContent = `Enviado con id ${data.id}`;
          f.reset();
        } else {
          msg.className = 'err';
          msg.textContent = data.error || 'Error';
        }
      });
    </script>
  </body>
</html>
src/app.js (reemplaza por esta versión con el endpoint nuevo)
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Contacto
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email y message son requeridos' });
  }
  // Simula persistencia y devuelve un id
  const id = Math.random().toString(36).slice(2, 10);
  res.status(201).json({ id, name, email, message });
});

module.exports = app;
__tests__/contact.test.js (nuevo)
const request = require('supertest');
const app = require('../src/app');

describe('Contact endpoint', () => {
  it('POST /api/contact → 400 si faltan campos', async () => {
    const res = await request(app).post('/api/contact').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/contact → 201 y devuelve id', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Ana',
      email: 'ana@test.com',
      message: 'Hola'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
4.4. Commit y push de la rama
git add .
git commit -m "feat: contacto UI + endpoint + tests (fixes #<NUM_ISSUE>)"
git push -u origin feat/contact-form
4.5. Crea el Pull Request hacia main

Ve a GitHub y abre tu repo en el navegador:
https://github.com/<tu-usuario>/ghflow-node-web

GitHub detectará la rama nueva y mostrará el aviso “Compare & pull request”. Haz clic allí.
(Si no lo ves: Pull requests → New pull request → base: main y compare: feat/contact-form.)

Llena los datos del PR

Título: deja el sugerido o:
feat: contacto UI + endpoint + tests (fixes #1)

Descripción: explica qué hiciste (formulario de contacto, endpoint /api/contact, pruebas).

Importante: asegúrate de incluir fixes #1 (o el número de issue correcto) para cierre automático al hacer merge.

Revisa los checks de CI

Tras crear el PR, GitHub Actions ejecutará el workflow ci.yml.

Verás un bloque con All checks have passed si todo está bien.

Si falla, entra a los logs, corrige en tu rama y git add/commit/push; el PR se actualiza solo.

Como main está protegido, no podrás hacer merge si el check falla.

Haz el merge

Cuando los checks pasen, usa el botón verde Merge pull request.

Puedes elegir Squash and merge (un solo commit limpio).

Confirma el merge; el código de feat/contact-form pasa a main.

Qué ocurre después

El issue con fixes #1 se cierra automáticamente.

El workflow ci se ejecuta otra vez por el push a main.

Ya puedes crear un release v1.0.0 en la pestaña Releases.
5) Publica un reléase desde la UI de GitHub

5.1 En tu repo: Releases → Draft a new release.

Choose a tag: escribe v1.0.0 y selecciona Create new tag on publish (target: main).

Release title: v1.0.0 (o “Primera versión”).

Release notes: pulsa Auto-generate release notes y edita si quieres o pega algo como:

Nueva página /contact.html

Endpoint POST /api/contact

Tests con Jest + Supertest

CI con GitHub Actions (workflow: ci)

5.2 Publish release.
Para una siguiente entrega compatible: v1.1.0. Para un fix: v1.0.1.
6) Cómo corre esto localmente

Instalar dependencias
npm install         # primera vez (o tras clonar)
# o, si vienes de CI y tienes package-lock.json:
# npm ci
Ejecutar tests
npm test
Levantar el servidor
npm run dev   # con nodemon (recarga en caliente)
# o
npm start     # node "normal"
Comprobar en el navegador

App: http://localhost:3000/

Form: http://localhost:3000/contact.html
