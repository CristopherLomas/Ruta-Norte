"use client";

import * as React from "react";
import {
  QrCode,
  Camera,
  CameraOff,
  Flashlight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Keyboard,
  User,
  MapPin,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { validateBoardingAction, BoardingValidationResult } from "@/features/inspector/actions";

export function QrScannerClient() {
  const [manualToken, setManualToken] = React.useState("");
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [hasTorch, setHasTorch] = React.useState(false);
  const [isTorchOn, setIsTorchOn] = React.useState(false);
  const [cameras, setCameras] = React.useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = React.useState<string>("");
  const [isValidating, setIsValidating] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<BoardingValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Cargar lista de cámaras disponibles
  React.useEffect(() => {
    async function getMediaDevices() {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === "videoinput");
          setCameras(videoDevices);
          if (videoDevices.length > 0) {
            // Priorizar cámara trasera si existe
            const backCamera = videoDevices.find((d) =>
              d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("trasera")
            );
            setSelectedCameraId(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
          }
        } catch {
          // Permisos aún no otorgados o navegador sin soporte
        }
      }
    }
    getMediaDevices();
  }, []);

  // Iniciar / Detener cámara
  const toggleCamera = async () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      await startCamera(selectedCameraId);
    }
  };

  const startCamera = async (deviceId?: string) => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("El navegador no soporta acceso a la cámara.");
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: "environment" } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsCameraActive(true);

      // Comprobar si soporta linterna (torch)
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities?.() || {}) as any;
      if (capabilities.torch) {
        setHasTorch(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo acceder a la cámara.";
      setErrorMessage(msg);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !isTorchOn }],
      });
      setIsTorchOn(!isTorchOn);
    } catch {
      // Linterna no disponible
    }
  };

  // Limpiar stream al desmontar
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Procesar validación con retroalimentación háptica y sonora
  const handleValidate = async (tokenToVerify: string) => {
    const clean = tokenToVerify.trim();
    if (!clean) return;

    setIsValidating(true);
    setErrorMessage(null);

    try {
      const res = await validateBoardingAction(clean);
      if (!res.success) {
        setErrorMessage(res.error || "Error al procesar la validación.");
        setLastResult(null);
        triggerHaptic(false);
      } else if (res.data) {
        setLastResult(res.data);
        triggerHaptic(res.data.valid);
      }
    } catch {
      setErrorMessage("Error de comunicación con el servidor.");
      triggerHaptic(false);
    } finally {
      setIsValidating(false);
    }
  };

  const triggerHaptic = (success: boolean) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (success) {
        navigator.vibrate([100, 50, 100]); // Patrón de éxito
      } else {
        navigator.vibrate([300, 100, 300]); // Patrón de error
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleValidate(manualToken);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 1. Módulo del Escáner y Cámara */}
      <Card className="bg-white border-2 border-brand-primary/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-brand-primary text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-brand-secondary" />
            <div>
              <h3 className="font-bold text-sm">Escáner de Boletos en Andén</h3>
              <p className="text-[10px] text-brand-light/70">Control de Abordaje en Tiempo Real</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
            Inspector Oficial
          </Badge>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Viewport de Cámara */}
          <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-700">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Cuadro visual de enfoque para código QR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-52 border-2 border-brand-secondary/80 rounded-2xl relative shadow-lg">
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-brand-secondary rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-brand-secondary rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-brand-secondary rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-brand-secondary rounded-br-lg" />
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-brand-secondary/40 animate-pulse" />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-6 text-slate-400 space-y-2">
                <CameraOff className="h-12 w-12 mx-auto text-slate-500 opacity-60" />
                <p className="text-xs">Cámara en espera o desactivada</p>
              </div>
            )}
          </div>

          {/* Controles de Cámara (Activar / Linterna / Selector) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={toggleCamera}
                variant={isCameraActive ? "destructive" : "default"}
                size="sm"
                className="gap-1.5 text-xs rounded-xl"
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="h-3.5 w-3.5" />
                    Detener Cámara
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5" />
                    Activar Cámara
                  </>
                )}
              </Button>

              {isCameraActive && hasTorch && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleTorch}
                  className={`text-xs gap-1.5 rounded-xl ${isTorchOn ? "bg-amber-100 text-amber-900 border-amber-300" : ""}`}
                >
                  <Flashlight className="h-3.5 w-3.5" />
                  {isTorchOn ? "Apagar Linterna" : "Linterna"}
                </Button>
              )}
            </div>

            {cameras.length > 1 && (
              <select
                className="h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  if (isCameraActive) {
                    stopCamera();
                    startCamera(e.target.value);
                  }
                }}
              >
                {cameras.map((c, i) => (
                  <option key={c.deviceId} value={c.deviceId}>
                    {c.label || `Cámara ${i + 1}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Campo de Entrada Manual de Token Opaco */}
          <div className="pt-4 border-t border-slate-100">
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Keyboard className="h-3.5 w-3.5 text-brand-secondary" />
                Ingreso Manual del Token (RN-XXXXXXXXXXXXXXXX)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ej. RN-4B7E9F12345678AB"
                  className="flex-1 h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                  required
                />
                <Button
                  type="submit"
                  disabled={isValidating || !manualToken.trim()}
                  className="h-11 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl px-5 font-bold text-xs gap-1.5 shadow-sm"
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Validar"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Panel de Respuesta Instantánea de Validación */}
      {lastResult && (
        <Card
          className={`border-2 rounded-2xl shadow-md overflow-hidden transition-all ${
            lastResult.valid
              ? "bg-emerald-50/60 border-emerald-500"
              : lastResult.code === "BOLETO_YA_UTILIZADO"
              ? "bg-amber-50/80 border-amber-500"
              : "bg-red-50/80 border-red-500"
          }`}
        >
          <div
            className={`p-4 text-white flex items-center justify-between ${
              lastResult.valid
                ? "bg-emerald-600"
                : lastResult.code === "BOLETO_YA_UTILIZADO"
                ? "bg-amber-600"
                : "bg-red-600"
            }`}
          >
            <div className="flex items-center gap-2">
              {lastResult.valid ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : lastResult.code === "BOLETO_YA_UTILIZADO" ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
              <div>
                <h4 className="font-extrabold text-base leading-tight">
                  {lastResult.valid
                    ? "EMBARQUE AUTORIZADO"
                    : lastResult.code === "BOLETO_YA_UTILIZADO"
                    ? "ALERTA: BOLETO YA UTILIZADO"
                    : "BOLETO RECHAZADO"}
                </h4>
                <p className="text-xs text-white/90">{lastResult.message}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs font-mono">
              {lastResult.code}
            </Badge>
          </div>

          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border">
                <span className="text-[10px] text-muted-foreground block">Asiento Asignado</span>
                <span className="text-2xl font-black text-brand-primary font-mono block">
                  {lastResult.seat_number || "S/N"}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border">
                <span className="text-[10px] text-muted-foreground block">Pasajero</span>
                <span className="font-bold text-slate-800 text-sm block truncate">
                  {lastResult.passenger_name || "Pasajero"}
                </span>
                <span className="text-[10px] text-emerald-600">Verificado</span>
              </div>

              <div className="p-3 bg-white rounded-xl border col-span-2 sm:col-span-1">
                <span className="text-[10px] text-muted-foreground block">Destino</span>
                <span className="font-bold text-brand-secondary text-sm block">
                  {lastResult.destination_name || "Destino"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate block">
                  {lastResult.route_name}
                </span>
              </div>
            </div>

            {lastResult.boarded_at && (
              <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-lg border">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Hora de Registro:</span>
                </div>
                <span className="font-mono font-bold">
                  {new Date(lastResult.boarded_at).toLocaleTimeString("es-EC", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
