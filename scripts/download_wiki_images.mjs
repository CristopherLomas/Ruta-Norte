import fs from 'node:fs';
import path from 'node:path';

const headers = {
  'User-Agent': 'RutaNorteApp/2.0 (https://ruta-norte.vercel.app; info@rutanorte.ec)'
};

const CITIES = [
  {
    slug: 'tulcan',
    name: 'Tulcán',
    province: 'Carchi',
    terminal: 'Terminal Terrestre de Tulcán',
    fileTitle: 'File:Cementerio,_Tulcán,_Ecuador,_2015-07-21,_DD_53-56_PAN.JPG',
    desc: 'Esculturas en ciprés del Cementerio de Tulcán'
  },
  {
    slug: 'julio-andrade',
    name: 'Julio Andrade',
    province: 'Carchi',
    terminal: 'Terminal Parroquial Julio Andrade',
    fileTitle: 'File:Vista_desde_Julio_Andrade,_Provincia_de_Carchi,_Ecuador,_2015-07-21,_DD_38-40_PAN.JPG',
    desc: 'Paisaje andino panorámico de Julio Andrade'
  },
  {
    slug: 'san-gabriel',
    name: 'San Gabriel',
    province: 'Carchi',
    terminal: 'Terminal Terrestre San Gabriel',
    fileTitle: 'File:San_Gabriel_Ecuador.jpg',
    desc: 'Centro colonial patrimonial de San Gabriel'
  },
  {
    slug: 'bolivar',
    name: 'Bolívar',
    province: 'Carchi',
    terminal: 'Terminal Cantonal Bolívar',
    fileTitle: 'File:Canton_Bolivar_-_Carchi.jpg',
    desc: 'Parque y cantón Bolívar'
  },
  {
    slug: 'el-angel',
    name: 'El Ángel',
    province: 'Carchi',
    terminal: 'Terminal Terrestre El Ángel',
    fileTitle: 'File:Frailejones_chiles.JPG',
    desc: 'Frailejones de la Reserva Ecológica El Ángel'
  },
  {
    slug: 'ibarra',
    name: 'Ibarra',
    province: 'Imbabura',
    terminal: 'Terminal Terrestre de Ibarra',
    fileTitle: 'File:Yahuarcocha2.JPG',
    desc: 'Laguna de Yahuarcocha con las montañas de Ibarra'
  },
  {
    slug: 'atuntaqui',
    name: 'Atuntaqui',
    province: 'Imbabura',
    terminal: 'Terminal Intercantonal Atuntaqui',
    fileTitle: 'File:Monumento_a_Antonio_Ante,_Atuntaqui.jpg',
    desc: 'Plaza central y monumento de Atuntaqui'
  },
  {
    slug: 'otavalo',
    name: 'Otavalo',
    province: 'Imbabura',
    terminal: 'Terminal Terrestre de Otavalo',
    fileTitle: 'File:Otavalo_Imbabura_nina_urkuwan.jpg',
    desc: 'Valle de Otavalo y Volcán Imbabura'
  },
  {
    slug: 'cotacachi',
    name: 'Cotacachi',
    province: 'Imbabura',
    terminal: 'Terminal Terrestre Cotacachi',
    fileTitle: 'File:Cuicocha,_Ecuador.jpg',
    desc: 'Laguna cratérica de Cuicocha'
  }
];

const targetDirs = [
  path.join(process.cwd(), 'frontend', 'public', 'images', 'cities'),
  path.join(process.cwd(), 'frontend', 'public', 'cities'),
  path.join(process.cwd(), 'public', 'images', 'cities'),
  path.join(process.cwd(), 'public', 'cities'),
];

// Crear directorios si no existen
for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function getImageUrl(fileTitle) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
  const res = await fetch(apiUrl, { headers });
  if (!res.ok) throw new Error(`Error en API: ${res.status}`);
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) throw new Error('No se encontraron páginas');
  const pageId = Object.keys(pages)[0];
  const info = pages[pageId]?.imageinfo?.[0];
  return info?.thumburl || info?.url;
}

async function downloadImage(url) {
  // Limpiar parámetros query si es necesario o enviar headers completos
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function run() {
  console.log('=== DESCARGANDO FOTOS 100% REALES DESDE WIKIMEDIA COMMONS ===');

  for (const city of CITIES) {
    try {
      console.log(`\nConsultando ${city.name} (${city.fileTitle})...`);
      const downloadUrl = await getImageUrl(city.fileTitle);
      console.log(`URL obtenida: ${downloadUrl}`);

      const buffer = await downloadImage(downloadUrl);
      console.log(`Descargado: ${(buffer.length / 1024).toFixed(1)} KB`);

      const filename = `${city.slug}.jpg`;
      for (const dir of targetDirs) {
        const dest = path.join(dir, filename);
        fs.writeFileSync(dest, buffer);
      }
      console.log(`✓ Guardado correctamente en todas las carpetas como ${filename}`);
    } catch (err) {
      console.error(`✗ Error con ${city.name}:`, err.message);
    }
  }

  console.log('\n=== PROCESO COMPLETADO CON ÉXITO ===');
}

run();
