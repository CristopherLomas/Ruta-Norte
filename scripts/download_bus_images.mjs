import fs from 'fs';
import path from 'path';

const BUSES = [
  {
    filename: 'bus-velotax.jpg',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Panamerican_Highway_Ibarra.jpg/1280px-Panamerican_Highway_Ibarra.jpg',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Panamerican_Highway_Ibarra.jpg',
    coop: 'Velotax del Norte'
  },
  {
    filename: 'bus-expreso-tulcan.jpg',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Cooperativa_Loja_Internacional_Ejecutivo.JPG/1280px-Cooperativa_Loja_Internacional_Ejecutivo.JPG',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Cooperativa_Loja_Internacional_Ejecutivo.JPG',
    coop: 'Expreso Tulcán'
  },
  {
    filename: 'bus-flota-imbabura.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/COT_925_Marcopolo_Paradiso_G7_1200.jpg',
    coop: 'Flota Imbabura'
  },
  {
    filename: 'bus-cooperativa-espejo.jpg',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Bus_Ecuador.jpg/1280px-Bus_Ecuador.jpg',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Bus_Ecuador.jpg',
    coop: 'Cooperativa Espejo'
  },
  {
    filename: 'bus-24-septiembre.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/EC_Bus_2012.jpg',
    coop: '24 de Septiembre'
  },
  {
    filename: 'bus-transportes-otavalo.jpg',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Terminal_Terrestre_Carcelen_Quito_--_Ecuador.jpg/1280px-Terminal_Terrestre_Carcelen_Quito_--_Ecuador.jpg',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Terminal_Terrestre_Carcelen_Quito_--_Ecuador.jpg',
    coop: 'Transportes Otavalo'
  }
];

const TARGET_DIRS = [
  'frontend/public/images/buses',
  'frontend/public/buses',
  'public/images/buses',
  'public/buses'
];

for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadBus(bus) {
  console.log(`Descargando foto real para: ${bus.coop}...`);
  let res = await fetch(bus.url, {
    headers: {
      'User-Agent': 'RutaNorteApp/2.0 (cristopher.lomas@upec.edu.ec; educational university project)'
    }
  });

  if (!res.ok && bus.fallback) {
    console.log(`Reintentando con fallback para ${bus.coop}...`);
    res = await fetch(bus.fallback, {
      headers: {
        'User-Agent': 'RutaNorteApp/2.0 (cristopher.lomas@upec.edu.ec; educational university project)'
      }
    });
  }

  if (!res.ok) {
    throw new Error(`Error ${res.status} al descargar ${bus.coop}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  for (const dir of TARGET_DIRS) {
    const filePath = path.join(dir, bus.filename);
    fs.writeFileSync(filePath, buffer);
  }
  console.log(`✅ Guardado: ${bus.filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function run() {
  for (const bus of BUSES) {
    try {
      await downloadBus(bus);
    } catch (err) {
      console.error(`❌ Fallo en ${bus.coop}:`, err.message);
    }
  }
  console.log('--- Proceso finalizado ---');
}

run();
