"use client";

import * as React from "react";
import jsQR from "jsqr";
import {
  QrCode,
  Camera,
  CameraOff,
  Flashlight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Keyboard,
  Clock,
  Loader2,
  RefreshCw,
  ScanLine,
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
  const [lastScannedCode, setLastScannedCode] = React.useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = React.useState(false);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const scanAnimFrameRef = React.useRef<number | null>(null);
  const lastScannedTimeRef = React.useRef<{ code: string; timestamp: number } | null>(null);
  const isValidatingRef = React.useRef(isValidating);

  // Mantener referencia sincronizada para el bucle de escaneo
  React.useEffect(() => {
    isValidatingRef.current = isValidating;
  }, [isValidating]);

  // Obtener lista de cámaras del sistema
  const refreshCameras = React.useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          // Priorizar cámara trasera si se detecta en la etiqueta
          const backCamera = videoDevices.find((d) => {
            const label = d.label.toLowerCase();
            return (
              label.includes("back") ||
              label.includes("trasera") ||
              label.includes("posterior") ||
              label.includes("environment")
            );
          });
          if (backCamera) {
            setSelectedCameraId(backCamera.deviceId);
          } else if (!selectedCameraId && videoDevices[0].deviceId) {
            setSelectedCameraId(videoDevices[0].deviceId);
          }
        }
      } catch (err) {
        console.warn("No se pudo enumerar dispositivos de video:", err);
      }
    }
  }, [selectedCameraId]);

  // Carga inicial pasiva de cámaras
  React.useEffect(() => {
    refreshCameras();
  }, [refreshCameras]);

  // Emitir señal de audio con Web Audio API (agudo para éxito, grave para error)
  const playAudioFeedback = (success: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Silencioso si el navegador bloquea audio
    }
  };

  const triggerHaptic = (success: boolean) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (success) {
        navigator.vibrate([100, 50, 100]);
      } else {
        navigator.vibrate([300, 100, 300]);
      }
    }
  };

  // Detener cámara de forma segura
  const stopCamera = React.useCallback(() => {
    if (scanAnimFrameRef.current) {
      cancelAnimationFrame(scanAnimFrameRef.current);
      scanAnimFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
    setHasTorch(false);
    setIsStartingCamera(false);
  }, []);

  // Iniciar cámara con fallback tolerante a fallos
  const startCamera = React.useCallback(async (targetDeviceId?: string) => {
    setErrorMessage(null);
    setIsStartingCamera(true);

    try {
      // 1. Validar compatibilidad del navegador y entorno seguro (HTTPS / localhost)
      if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        throw new Error(
          "El acceso a la cámara requiere conexión segura (HTTPS o localhost). Si usa un teléfono en red local, use HTTPS."
        );
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Su navegador o dispositivo no soporta la API de cámara.");
      }

      // Detener cualquier stream previo
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      // 2. Definir restricciones flexibles (ideal en vez de exact para prevenir OverconstrainedError)
      const constraints: MediaStreamConstraints = {
        video: targetDeviceId && targetDeviceId.trim() !== ""
          ? {
              deviceId: { ideal: targetDeviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr: unknown) {
        console.warn("Fallo al solicitar cámara con restricciones ideales, intentando fallback simple...", firstErr);
        // Fallback genérico si el dispositivo rechaza resolución o id específico
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;

      // 3. Conectar el stream al elemento de video siempre montado
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Aviso al reproducir video:", playErr);
        }
      }

      setIsCameraActive(true);

      // 4. Comprobar soporte de linterna (torch)
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities?.() || {}) as { torch?: boolean };
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }

      // 5. Tras otorgar permisos, actualizar lista de cámaras para obtener nombres reales
      await refreshCameras();
    } catch (err: unknown) {
      console.error("Error al acceder a la cámara:", err);
      let friendlyMsg = "No se pudo acceder a la cámara.";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          friendlyMsg = "Permiso de cámara denegado. Por favor, habilite el permiso en la barra de navegación del navegador.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          friendlyMsg = "No se encontró ninguna cámara conectada en este equipo.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          friendlyMsg = "La cámara está siendo ocupada por otra aplicación o pestaña. Ciérrela e intente de nuevo.";
        } else if (err.name === "OverconstrainedError") {
          friendlyMsg = "La cámara seleccionada no cumple con la resolución requerida. Pruebe otra cámara.";
        } else {
          friendlyMsg = err.message;
        }
      }

      setErrorMessage(friendlyMsg);
      setIsCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  }, [refreshCameras]);

  // Toggle cámara
  const toggleCamera = async () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      await startCamera(selectedCameraId);
    }
  };

  // Alternar linterna
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      await (track as unknown as { applyConstraints: (c: { advanced: Array<{ torch: boolean }> }) => Promise<void> }).applyConstraints({
        advanced: [{ torch: !isTorchOn }],
      });
      setIsTorchOn(!isTorchOn);
    } catch {
      // Linterna no disponible
    }
  };

  // Asegurar que si el elemento video se monta o cambia, el stream siga asignado
  React.useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isCameraActive]);

  // Limpiar stream al desmontar el componente
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Procesar validación con retroalimentación háptica y sonora
  const handleValidate = React.useCallback(async (tokenToVerify: string) => {
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
        playAudioFeedback(false);
      } else if (res.data) {
        setLastResult(res.data);
        triggerHaptic(res.data.valid);
        playAudioFeedback(res.data.valid);
      }
    } catch {
      setErrorMessage("Error de comunicación con el servidor.");
      triggerHaptic(false);
      playAudioFeedback(false);
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Bucle de detección y escaneo de códigos QR en tiempo real
  React.useEffect(() => {
    if (!isCameraActive) {
      if (scanAnimFrameRef.current) {
        cancelAnimationFrame(scanAnimFrameRef.current);
        scanAnimFrameRef.current = null;
      }
      return;
    }

    let isScanningLoopActive = true;
    type BarcodeDetectorType = { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> };
    let nativeDetector: BarcodeDetectorType | null = null;

    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        const DetectorClass = (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => BarcodeDetectorType }).BarcodeDetector;
        nativeDetector = new DetectorClass({ formats: ["qr_code"] });
      } catch {
        nativeDetector = null;
      }
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const scanFrame = async () => {
      if (!isScanningLoopActive) return;

      const video = videoRef.current;
      if (
        video &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        let detectedCode: string | null = null;

        // 1. Intentar BarcodeDetector nativo (rápido y con aceleración GPU)
        if (nativeDetector) {
          try {
            const results = await nativeDetector.detect(video);
            if (results && results.length > 0 && results[0].rawValue) {
              detectedCode = results[0].rawValue;
            }
          } catch {
            // Continuar con jsQR
          }
        }

        // 2. Si no detectó con API nativa, usar jsQR con canvas
        if (!detectedCode && ctx) {
          try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (qrResult && qrResult.data) {
              detectedCode = qrResult.data;
            }
          } catch {
            // Ignorar errores puntuales en la captura del frame
          }
        }

        // 3. Procesar código detectado si no está en cooldown
        if (detectedCode) {
          const trimmed = detectedCode.trim();
          const now = Date.now();
          const last = lastScannedTimeRef.current;
          const isSameCodeRecent = last && last.code === trimmed && now - last.timestamp < 3500;

          if (!isSameCodeRecent && !isValidatingRef.current) {
            lastScannedTimeRef.current = { code: trimmed, timestamp: now };
            setLastScannedCode(trimmed);
            setTimeout(() => setLastScannedCode(null), 1500);

            // Disparar validación automática del boleto
            handleValidate(trimmed);
          }
        }
      }

      // Intervalo adaptativo de ~130ms para equilibrio perfecto entre detección rápida y bajo consumo de CPU
      if (isScanningLoopActive) {
        setTimeout(() => {
          if (isScanningLoopActive) {
            scanAnimFrameRef.current = requestAnimationFrame(scanFrame);
          }
        }, 130);
      }
    };

    scanAnimFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanningLoopActive = false;
      if (scanAnimFrameRef.current) {
        cancelAnimationFrame(scanAnimFrameRef.current);
        scanAnimFrameRef.current = null;
      }
    };
  }, [isCameraActive, handleValidate]);

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
            {/* Elemento de video SIEMPRE presente en el DOM para evitar que ref sea nulo */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isCameraActive ? "opacity-100 block" : "opacity-0 hidden"
              }`}
            />

            {/* Marcador visual de enfoque para código QR */}
            {isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`w-52 h-52 border-2 rounded-2xl relative shadow-lg transition-all duration-300 ${
                    lastScannedCode
                      ? "border-emerald-400 bg-emerald-500/10 scale-105"
                      : "border-brand-secondary/80"
                  }`}
                >
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-brand-secondary rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-brand-secondary rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-brand-secondary rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-brand-secondary rounded-br-lg" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-brand-secondary/40 animate-pulse" />

                  {/* Indicador flotante de lectura activa */}
                  <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
                    <span className="bg-black/70 backdrop-blur-sm text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ScanLine className="h-3 w-3 animate-pulse" />
                      Lector activo en vivo
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Estado inactivo */}
            {!isCameraActive && (
              <div className="text-center p-6 text-slate-400 space-y-2">
                <CameraOff className="h-12 w-12 mx-auto text-slate-500 opacity-60" />
                <p className="text-xs font-medium">Cámara en espera o desactivada</p>
                <p className="text-[10px] text-slate-500">
                  Presiona &quot;Activar Cámara&quot; para escanear boletos
                </p>
              </div>
            )}
          </div>

          {/* Controles de Cámara (Activar / Linterna / Selector) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={toggleCamera}
                disabled={isStartingCamera}
                variant={isCameraActive ? "destructive" : "default"}
                size="sm"
                className="gap-1.5 text-xs rounded-xl"
              >
                {isStartingCamera ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Iniciando...
                  </>
                ) : isCameraActive ? (
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
                  className={`text-xs gap-1.5 rounded-xl ${
                    isTorchOn ? "bg-amber-100 text-amber-900 border-amber-300" : ""
                  }`}
                >
                  <Flashlight className="h-3.5 w-3.5" />
                  {isTorchOn ? "Apagar Linterna" : "Linterna"}
                </Button>
              )}
            </div>

            {/* Selector de cámara si hay más de 1 dispositivo */}
            {cameras.length > 1 && (
              <div className="flex items-center gap-1.5">
                <select
                  className="h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 max-w-[200px] truncate"
                  value={selectedCameraId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedCameraId(newId);
                    if (isCameraActive) {
                      stopCamera();
                      startCamera(newId);
                    }
                  }}
                >
                  {cameras.map((c, i) => (
                    <option key={c.deviceId || i} value={c.deviceId}>
                      {c.label || `Cámara ${i + 1}`}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500"
                  onClick={refreshCameras}
                  title="Actualizar lista de cámaras"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
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
