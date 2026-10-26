import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://npgxydljljhatmjaaxnj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZ3h5ZGxqbGpoYXRtamFheG5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkwNzI5MywiZXhwIjoyMTA0NDgzMjkzfQ.oQhe6wzDLBj7Hp3jG1NJIsO5-E9nDF9A-E0zBDIyQno';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const CITIES = [
  { id: 1, name: 'Tulcán', province: 'Carchi', km: 0 },
  { id: 2, name: 'Julio Andrade', province: 'Carchi', km: 24 },
  { id: 3, name: 'San Gabriel', province: 'Carchi', km: 40 },
  { id: 4, name: 'Bolívar', province: 'Carchi', km: 60 },
  { id: 5, name: 'El Ángel', province: 'Carchi', km: 75 },
  { id: 6, name: 'Ibarra', province: 'Imbabura', km: 125 },
  { id: 7, name: 'Atuntaqui', province: 'Imbabura', km: 137 },
  { id: 8, name: 'Otavalo', province: 'Imbabura', km: 150 },
  { id: 9, name: 'Cotacachi', province: 'Imbabura', km: 145 },
];

function calculatePrice(c1, c2) {
  const dist = Math.abs(c1.km - c2.km);
  if (dist <= 25) return 1.50;
  if (dist <= 50) return 2.25;
  if (dist <= 85) return 3.00;
  if (dist <= 130) return 3.75;
  return 4.50;
}

const SHIFTS = [
  { shift: 'MORNING', time: '07:30:00' },
  { shift: 'AFTERNOON', time: '13:30:00' },
  { shift: 'NIGHT', time: '18:30:00' },
];

async function seed() {
  console.log('=== POBLADO MASIVO Y REAL DE RUTAS EN SUPABASE CLOUD (8 DÍAS) ===');
  console.log(`Conectando a: ${SUPABASE_URL}`);

  // 1. Verificar ciudades
  const { data: dbCities, error: citiesErr } = await supabase.from('cities').select('*');
  if (citiesErr) {
    console.error('Error al obtener ciudades:', citiesErr);
    process.exit(1);
  }
  console.log(`Ciudades activas en Supabase: ${dbCities.length}`);

  // 2. Actualizar URLs HD de ciudades en Supabase
  console.log('Actualizando fotos HD de ciudades en Supabase...');
  for (const c of CITIES) {
    const slug = c.name.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const imgUrl = `/images/cities/${slug === 'el-angel' ? 'el-angel' : slug === 'julio-andrade' ? 'julio-andrade' : slug === 'san-gabriel' ? 'san-gabriel' : slug}.jpg`;
    await supabase.from('cities').update({ image_url: imgUrl }).eq('id', c.id);
  }

  // 3. Generar fechas desde hoy hasta hoy + 7 días (8 días en total)
  const today = new Date();
  const dates = [];
  for (let d = 0; d < 8; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() + d);
    dates.push(dt.toISOString().split('T')[0]);
  }
  console.log(`Rango de 8 días: ${dates[0]} hasta ${dates[dates.length - 1]}`);

  // 4. Limpiar viajes anteriores para evitar duplicados masivos
  console.log('Limpiando viajes existentes en el rango de fechas...');
  const { error: delErr } = await supabase.from('trips').delete().gte('departure_date', dates[0]).lte('departure_date', dates[dates.length - 1]);
  if (delErr) {
    console.warn('Aviso al limpiar viajes (puede haber tickets asociados):', delErr.message);
  }

  // 5. Construir los 1,728 viajes (72 rutas x 8 días x 3 turnos)
  const allTrips = [];
  let busCounter = 1;

  for (const date of dates) {
    for (const origin of CITIES) {
      for (const dest of CITIES) {
        if (origin.id === dest.id) continue;

        const price = calculatePrice(origin, dest);

        for (const s of SHIFTS) {
          const busId = ((busCounter - 1) % 6) + 1;
          busCounter++;

          allTrips.push({
            origin_city_id: origin.id,
            destination_city_id: dest.id,
            bus_id: busId,
            departure_date: date,
            departure_time: s.time,
            shift: s.shift,
            price: price,
          });
        }
      }
    }
  }

  console.log(`Total de viajes generados para insertar: ${allTrips.length}`);

  // 6. Insertar en lotes de 150 registros
  const BATCH_SIZE = 150;
  let inserted = 0;

  for (let i = 0; i < allTrips.length; i += BATCH_SIZE) {
    const batch = allTrips.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('trips').insert(batch);
    if (error) {
      console.error(`Error al insertar lote ${i / BATCH_SIZE + 1}:`, error.message);
    } else {
      inserted += batch.length;
      process.stdout.write(`\rInsertados: ${inserted} / ${allTrips.length} viajes...`);
    }
  }

  console.log('\n✓ ¡Poblado masivo completado con éxito!');

  // 7. Verificación final de conteo
  const { count } = await supabase.from('trips').select('*', { count: 'exact', head: true });
  console.log(`Total de viajes registrados en Supabase Cloud ahora: ${count}`);
}

seed().catch(console.error);
