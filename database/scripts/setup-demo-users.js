const https = require("https");

const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZ3h5ZGxqbGpoYXRtamFheG5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkwNzI5MywiZXhwIjoyMTA0NDgzMjkzfQ.oQhe6wzDLBj7Hp3jG1NJIsO5-E9nDF9A-E0zBDIyQno";
const host = "npgxydljljhatmjaaxnj.supabase.co";

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

const demoAccounts = [
  {
    email: "operador.demo@rutanorte.ec",
    password: "DemoPassword2026!",
    fullName: "Manuel Benalcázar (Operador Demo)",
    roleId: "00000000-0000-0000-0000-000000000002" // operator
  },
  {
    email: "vendedor.demo@rutanorte.ec",
    password: "DemoPassword2026!",
    fullName: "Rosa Elena Caicedo (Ventanilla Tulcán)",
    roleId: "00000000-0000-0000-0000-000000000003" // seller
  },
  {
    email: "inspector.demo@rutanorte.ec",
    password: "DemoPassword2026!",
    fullName: "Sgto. Ramiro Cuasquer (Inspector Andén)",
    roleId: "00000000-0000-0000-0000-000000000004" // inspector
  },
  {
    email: "pasajero.demo@rutanorte.ec",
    password: "DemoPassword2026!",
    fullName: "Estefanía Villareal (Pasajera Frecuente)",
    roleId: "00000000-0000-0000-0000-000000000005" // passenger
  }
];

async function createDemoUsers() {
  console.log("Creando y configurando cuentas de demostración oficiales...");

  for (const acc of demoAccounts) {
    const payload = JSON.stringify({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: { full_name: acc.fullName, is_demo: true }
    });

    const createRes = await request(
      {
        hostname: host,
        path: "/auth/v1/admin/users",
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload)
        }
      },
      payload
    );

    let userId = null;
    if (createRes.status === 200 || createRes.status === 201) {
      const user = JSON.parse(createRes.data);
      userId = user.id;
      console.log(`✓ Creado Auth User: ${acc.email} (${userId})`);
    } else {
      // Si ya existe, buscar su ID
      console.log(`ℹ Usuario ya existente o respuesta ${createRes.status}: ${acc.email}`);
      const listRes = await request({
        hostname: host,
        path: "/auth/v1/admin/users",
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
      });
      const users = JSON.parse(listRes.data).users || [];
      const match = users.find((u) => u.email === acc.email);
      if (match) userId = match.id;
    }

    if (userId) {
      // 1. Marcar is_demo = true en profile
      const profPayload = JSON.stringify({ full_name: acc.fullName, is_demo: true });
      await request(
        {
          hostname: host,
          path: `/rest/v1/profiles?id=eq.${userId}`,
          method: "PATCH",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(profPayload)
          }
        },
        profPayload
      );

      // 2. Asignar rol correspondiente
      const rolePayload = JSON.stringify({ role_id: acc.roleId });
      await request(
        {
          hostname: host,
          path: `/rest/v1/user_roles?user_id=eq.${userId}`,
          method: "PATCH",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(rolePayload)
          }
        },
        rolePayload
      );
      console.log(`✓ Rol y Perfil configurados para: ${acc.email}`);
    }
  }

  console.log("\n¡Todas las cuentas demo operativas han sido creadas exitosamente!");
}

createDemoUsers().catch(console.error);
