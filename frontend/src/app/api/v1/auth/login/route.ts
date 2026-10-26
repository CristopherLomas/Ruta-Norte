import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Comprobación de usuarios demo principales
    if (cleanEmail === "admin@rutanorte.ec" && password === "admin123") {
      return NextResponse.json({
        id: "usr-admin-1",
        fullName: "Administrador General",
        email: cleanEmail,
        role: "ADMIN",
        token: "demo-jwt-admin-token",
      });
    }

    if (cleanEmail === "taquilla@rutanorte.ec" && password === "taquilla123") {
      return NextResponse.json({
        id: "usr-staff-1",
        fullName: "Operador de Taquilla",
        email: cleanEmail,
        role: "STAFF",
        token: "demo-jwt-staff-token",
      });
    }

    if (cleanEmail === "pasajero@rutanorte.ec" && password === "pasajero123") {
      return NextResponse.json({
        id: "usr-passenger-1",
        fullName: "Pasajero Frecuente",
        email: cleanEmail,
        role: "PASSENGER",
        token: "demo-jwt-passenger-token",
      });
    }

    // Consulta en tabla users de Supabase
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      token: "jwt-supabase-token",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
