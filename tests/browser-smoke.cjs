/**
 * Real Cesium/Chromium smoke test. Run npm run test:browser from the repo root.
 * The debug bridge is injected only into the test response, never the app bundle.
 * Optional env: CESIUM_BROWSER_EXECUTABLE, CESIUM_TEST_CESIUM_PATH (Build/Cesium),
 * CESIUM_TEST_SCREENSHOTS (output directory), CESIUM_TEST_PORT (default 8087).
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const source = fs.readFileSync('dist/app.js', 'utf8');
const p = (x, y) => ({ lon: (x * Math.PI) / 180, lat: (y * Math.PI) / 180 });
const box = (x, y) => [p(x, y), p(x + 2, y), p(x + 2, y + 2), p(x, y + 2)];
(async () => {
  const port = process.env.CESIUM_TEST_PORT || '8087';
  const server = require('node:child_process').spawn(
    'python3',
    ['-m', 'http.server', port, '--directory', 'dist'],
    { stdio: 'ignore' },
  );
  process.on('exit', () => server.kill());
  for (let i = 0; i < 30; i++) {
    try {
      await fetch(`http://127.0.0.1:${port}`);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  const browser = await chromium.launch({
    executablePath: process.env.CESIUM_BROWSER_EXECUTABLE || undefined,
    headless: true,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => {
    errors.push(e.message);
    console.log('page error:', e.message);
  });
  page.on('requestfailed', (r) => console.log('request failed:', r.url(), r.failure()?.errorText));
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('console:', m.text());
  });
  await page.route('**/app.js', (r) =>
    r.fulfill({
      contentType: 'text/javascript',
      body:
        source +
        `\nwindow.__qa={get shapes(){return shapes},get viewer(){return viewer},get selected(){return [...selectedIds]},get draft(){return draft},get visuals(){return visuals},get drag(){return drag},get history(){return history},select,setMode,addVertex,applyDrag,screen:(p)=>Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene,toCartesian(p))};`,
    }),
  );
  if (process.env.CESIUM_TEST_CESIUM_PATH)
    await page.route('**/npm/cesium@1.121.0/Build/Cesium/**', async (r) => {
      const rel = new URL(r.request().url()).pathname.split('/Build/Cesium/')[1];
      const asset = require('node:path').join(process.env.CESIUM_TEST_CESIUM_PATH, rel);
      const mime = rel.endsWith('.js')
        ? 'text/javascript'
        : rel.endsWith('.css')
          ? 'text/css'
          : rel.endsWith('.jpg')
            ? 'image/jpeg'
            : rel.endsWith('.png')
              ? 'image/png'
              : rel.endsWith('.json')
                ? 'application/json'
                : 'application/octet-stream';
      await r.fulfill({
        status: 200,
        body: fs.readFileSync(asset),
        contentType: mime,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    });
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => document.querySelector('#loading').hidden, null, {
    timeout: 15000,
  });
  await page.addInitScript(
    (shapes) => {
      if (!sessionStorage.qaSeeded) {
        localStorage.setItem('cesium-advanced-controls-v1', JSON.stringify({ version: 1, shapes }));
        sessionStorage.qaSeeded = 'yes';
      }
    },
    [
      { id: 'a', type: 'polygon', name: 'Alpha', vertices: box(0, 0) },
      { id: 'b', type: 'polygon', name: 'Beta', vertices: box(1, 1) },
    ],
  );
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#loading').hidden);
  assert.equal(
    await page.evaluate(() => __qa.visuals.get('a').label.label.text.getValue()),
    'Alpha',
  );
  await page.locator('#shapeCount').click();
  await page.locator('#shapeList button').first().click();
  await page.locator('#nameInput').fill('Coverage Alpha');
  await page.locator('#nameForm button').click();
  assert.equal(await page.locator('#shapeName').textContent(), 'Coverage Alpha');
  assert.equal(
    await page.evaluate(() => __qa.visuals.get('a').label.label.text.getValue()),
    'Coverage Alpha',
  );
  await page.locator('#multiSelectTool').click();
  await page.locator('#shapeCount').click();
  await page.locator('#shapeList button').nth(1).click();
  assert.equal(await page.locator('#selectionCount').textContent(), '2 shapes selected');
  assert.equal(await page.locator('#mergeShapes').isEnabled(), true);
  await page.locator('#mergeShapes').click();
  assert.equal(await page.evaluate(() => __qa.shapes.length), 1);
  assert.equal(await page.evaluate(() => __qa.shapes[0].type), 'polygon');
  await page.locator('#undoEdit').click();
  assert.equal(await page.evaluate(() => __qa.shapes.length), 2);
  await page.locator('#redoEdit').click();
  assert.equal(await page.evaluate(() => __qa.shapes.length), 1);
  await page.locator('#undoEdit').click();
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#loading').hidden);
  assert.equal(await page.evaluate(() => __qa.shapes[0].name), 'Coverage Alpha');
  await page.locator('#shapeCount').click();
  await page.locator('#shapeList button').first().click();
  if (process.env.CESIUM_TEST_SCREENSHOTS) {
    fs.mkdirSync(process.env.CESIUM_TEST_SCREENSHOTS, { recursive: true });
    await page.screenshot({
      path: require('node:path').join(process.env.CESIUM_TEST_SCREENSHOTS, 'desktop.png'),
    });
  }
  // Actual handle dragging restores original geometry when the endpoint crosses another edge.
  const original = await page.evaluate(() => JSON.stringify(__qa.shapes[0].vertices));
  const start = await page.evaluate(() => __qa.screen(__qa.shapes[0].vertices[0]));
  const end = await page.evaluate((p) => __qa.screen(p), p(3, 1));
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  assert.equal(await page.evaluate(() => __qa.drag?.kind), 'vertex');
  await page.mouse.move(end.x, end.y);
  await page.mouse.up();
  assert.equal(await page.evaluate(() => JSON.stringify(__qa.shapes[0].vertices)), original);
  assert.match(await page.locator('#toast').textContent(), /restored/);
  // A real midpoint insertion is removed when dragged through the far edge.
  const middle = await page.evaluate(() => __qa.screen({ lon: Math.PI / 180, lat: 0 }));
  const beyond = await page.evaluate(() =>
    __qa.screen({ lon: Math.PI / 180, lat: (2.3 * Math.PI) / 180 }),
  );
  await page.mouse.move(middle.x, middle.y);
  await page.mouse.down();
  assert.equal(await page.evaluate(() => __qa.drag?.newVertex), true);
  assert.equal(await page.evaluate(() => __qa.shapes[0].vertices.length), 5);
  await page.mouse.move(beyond.x, beyond.y);
  await page.mouse.up();
  assert.equal(await page.evaluate(() => JSON.stringify(__qa.shapes[0].vertices)), original);
  assert.match(await page.locator('#toast').textContent(), /New point removed/);
  // Polygon drawing uses its production validation when adding a crossing point.
  await page.locator('#polygonTool').click();
  for (const point of [p(0, 0), p(2, 0), p(2, 2), p(3, 1)])
    await page.evaluate((point) => __qa.addVertex(point), point);
  assert.equal(await page.evaluate(() => __qa.draft.vertices.length), 3);
  assert.match(await page.locator('#toast').textContent(), /New point removed/);
  await page.locator('#cancelDrawing').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#shapeCount').click();
  await page.locator('#shapeList button').first().click();
  if (process.env.CESIUM_TEST_SCREENSHOTS)
    await page.screenshot({
      path: require('node:path').join(process.env.CESIUM_TEST_SCREENSHOTS, 'mobile.png'),
    });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.equal(await page.locator('#nameInput').isVisible(), true);
  await page.locator('#multiSelectTool').click();
  await page.locator('#shapeCount').click();
  await page.locator('#shapeList button').nth(1).click();
  assert.equal(await page.locator('#mergeShapes').isVisible(), true);
  if (process.env.CESIUM_TEST_SCREENSHOTS)
    await page.screenshot({
      path: require('node:path').join(process.env.CESIUM_TEST_SCREENSHOTS, 'mobile-multi.png'),
    });
  assert.deepEqual(errors, []);
  console.log(
    'PASS: real Cesium labels, rename/save, touch multi-selection, merge, undo/redo, crossing vertex/midpoint drags and draft rejection; desktop/mobile layout; no page errors.',
  );
  await browser.close();
  server.kill();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
