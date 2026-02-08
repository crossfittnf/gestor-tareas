const puppeteer = require('puppeteer');
const fs = require('fs');

async function runScraper() {
    console.log('🚀 SCRIPT FINAL: Extracción Total 14 Días 🚀');

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
        userDataDir: './user_data',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });

    const page = await browser.newPage();

    try {
        await page.goto('https://aimharder.com/login', { waitUntil: 'networkidle0' });

        // A. ESPERA LOGIN
        if (await page.evaluate(() => window.location.href.includes('login'))) {
            console.log('⏳ Esperando login manual...');
            await page.waitForFunction(() => !window.location.href.includes('login'), { timeout: 0 });
        }
        console.log('✅ Sesión iniciada.');

        // B. ESPERA PANTALLA CORRECTA (Tú navegas, yo detecto)
        console.log('👉 Ve a "CLIENTES SIN RESERVA". Detectando...');
        await page.waitForFunction(() => document.body.innerText.toUpperCase().includes('CLIENTES SIN RESERVAS'), { timeout: 0 });
        console.log('✅ Pantalla detectada.');

        // C. FILTRADO AGOTADOS (FORZADO)
        await page.waitForSelector('#select2-filterTarifa-container', { timeout: 10000 });
        await page.click('#select2-filterTarifa-container');
        await new Promise(r => setTimeout(r, 1500));

        await page.evaluate(() => {
            const op = Array.from(document.querySelectorAll('.select2-results__option'))
                .find(o => o.innerText.toLowerCase().includes('agotados'));
            if (op) {
                op.click();
                const sel = document.getElementById('filterTarifa');
                if (sel) {
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    if (window.$) $(sel).trigger('change');
                }
            }
        });

        // D. BOTÓN BUSCAR (Crucial)
        console.log('🔍 Buscando botón "Consultar" o similar...');
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button, a.btn, .btn'));
            const buscar = btns.find(b => b.innerText.toLowerCase().includes('consultar') || b.innerText.toLowerCase().includes('buscar'));
            if (buscar) buscar.click();
        });

        console.log('⏳ Cargando datos (10s)...');
        await new Promise(r => setTimeout(r, 10000));

        // E. EXTRACCIÓN CON PAGINACIÓN
        let todosLosClientes = [];
        let pagina = 1;

        while (pagina < 4) { // Máximo 3 páginas para no buclear
            console.log(`📝 Leyendo página ${pagina}...`);

            const extraidos = await page.evaluate(() => {
                const table = Array.from(document.querySelectorAll('table')).find(t => t.innerText.toLowerCase().includes('última reserva'));
                if (!table) return { error: "No hay tabla" };

                // Encontrar columnas
                const headers = Array.from(table.querySelectorAll('th, td')).slice(0, 15);
                let colNom = 0, colFec = 2, colTlf = 3;
                headers.forEach((h, i) => {
                    const t = h.innerText.toLowerCase();
                    if (t.includes('cliente')) colNom = i;
                    if (t.includes('última') || t.includes('ultima')) colFec = i;
                    if (t.includes('teléfono') || t.includes('telefono')) colTlf = i;
                });

                const targetDate = "11/12/2025";
                const rows = Array.from(table.querySelectorAll('tbody tr, tr')).filter(r => r.querySelectorAll('td').length > 3);

                return rows.map(r => {
                    const c = r.querySelectorAll('td');
                    const f = c[colFec] ? c[colFec].innerText.trim() : "";
                    if (f === targetDate) {
                        return {
                            nombre: c[colNom] ? c[colNom].innerText.split('\n')[0].trim() : "N/A",
                            fecha: f,
                            telefono: c[colTlf] ? c[colTlf].innerText.replace(/\D/g, '').trim() : ""
                        };
                    }
                    return null;
                }).filter(x => x !== null);
            });

            if (extraidos.length > 0) todosLosClientes.push(...extraidos);

            // Siguiente página
            const pasoPagina = await page.evaluate(() => {
                const next = Array.from(document.querySelectorAll('a, button, span')).find(el =>
                    el.innerText.includes('Next') || el.innerText.includes('Siguiente') || el.innerText === '>'
                );
                if (next && !next.classList.contains('disabled')) {
                    next.click();
                    return true;
                }
                return false;
            });

            if (!pasoPagina) break;
            console.log('➡️ Yendo a la siguiente página...');
            await new Promise(r => setTimeout(r, 4000));
            pagina++;
        }

        // F. GUARDAR
        const unicos = Array.from(new Set(todosLosClientes.map(c => JSON.stringify(c)))).map(s => JSON.parse(s));
        console.log(`✅ ¡HECHO! Encontrados ${unicos.length} clientes.`);
        console.log(JSON.stringify(unicos, null, 2));
        fs.writeFileSync('clientes_recuperacion.json', JSON.stringify(unicos, null, 2));

    } catch (e) {
        console.error('❌ ERROR:', e);
    } finally {
        console.log('🤖 Fin.');
    }
}

runScraper();
