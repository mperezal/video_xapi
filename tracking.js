document.addEventListener("DOMContentLoaded", function() {
    // Seleccionar el video después de que el DOM haya cargado
    var video = document.getElementById("myVideo");

    if (!video) {
        console.error("Error: No se encontró el elemento de video.");
        return;
    }

    console.log("✅ Video encontrado correctamente.");

    // Configuración del LRS (usando la configuración que proporcionaste)
    var conf = {
        endpoint: "https://cloud.scorm.com/lrs/VVIL00T1VK/sandbox/",
        auth: "Basic " + btoa("lrABLGNivmg_RtIBo6o:zE7laxLVNQMOsvF_O9Y")
    };
    ADL.XAPIWrapper.changeConfig(conf);

    // Variables para tracking
    var startTime;
    var totalTimeWatched = 0;
    var lastTimeUpdate = 0;
    var videoId = "https://tudominio.com/xapi/video/cliente";
    var sessionId = generateUUID();

    /**
     * Genera un UUID para identificar la sesión
     */
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Convierte segundos a formato ISO 8601 Duration
     * @param {number} seconds - Duración en segundos
     * @return {string} - Duración en formato ISO 8601 (PT1H30M15S)
     */
    function secondsToDuration(seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var secs = Math.floor(seconds % 60);
        
        var duration = "PT";
        if (hours > 0) duration += hours + "H";
        if (minutes > 0) duration += minutes + "M";
        if (secs > 0 || (hours === 0 && minutes === 0)) duration += secs + "S";
        
        return duration;
    }

    /**
     * Función para enviar un statement xAPI.
     * @param {string} verb - URI del verbo (por ejemplo, "completed", "played", etc.)
     * @param {string} description - Descripción en lenguaje natural del verbo.
     * @param {object} additionalResult - Propiedades adicionales del resultado
     * @param {object} contextExtensions - Extensiones de contexto adicionales
     */
    function enviarStatement(verb, description, additionalResult = {}, contextExtensions = {}) {
        // Objeto result base
        var result = {};
        
        // Si se proporciona duration, convertirlo al formato ISO 8601
        if (additionalResult.duration !== undefined) {
            result.duration = secondsToDuration(additionalResult.duration);
            delete additionalResult.duration;
        }
        
        // Si hay tiempo actual, añadirlo como extensión
        if (additionalResult.currentTime !== undefined) {
            if (!result.extensions) {
                result.extensions = {};
            }
            result.extensions["https://id.tincanapi.com/extension/time"] = additionalResult.currentTime;
            delete additionalResult.currentTime;
        }
        
        // Integrar propiedades adicionales al resultado
        for (var key in additionalResult) {
            result[key] = additionalResult[key];
        }

        // Contexto base con registro de la sesión
        var context = {
            "registration": sessionId,
            "extensions": {
                "https://id.tincanapi.com/extension/session-id": sessionId
            }
        };
        
        // Integrar extensiones de contexto adicionales
        for (var key in contextExtensions) {
            context.extensions[key] = contextExtensions[key];
        }

        var statement = {
            "actor": {
                "mbox": "mailto:usuario@ejemplo.com",
                "name": "Usuario Ejemplo",
                "objectType": "Agent"
            },
            "verb": {
                "id": verb,
                "display": { 
                    "es-ES": description,
                    "en-US": description 
                }
            },
            "object": {
                "id": videoId,
                "definition": {
                    "name": { "es-ES": "Video de Cliente", "en-US": "Client Video" },
                    "description": { "es-ES": "Un video del cliente que se está observando.", "en-US": "A client video being watched." },
                    "type": "https://w3id.org/xapi/video/activity-type/video"
                },
                "objectType": "Activity"
            },
            "context": context,
            "timestamp": new Date().toISOString()
        };
        
        // Solo incluir result si tiene propiedades
        if (Object.keys(result).length > 0) {
            statement.result = result;
        }

        ADL.XAPIWrapper.sendStatement(statement, function(resp, obj) {
            console.log("📤 Statement enviado:", description, obj);
        });
    }

    // Evento: Video comienza
    video.addEventListener("play", function() {
        if (!startTime) {
            startTime = new Date();
        }
        
        enviarStatement(
            "http://adlnet.gov/expapi/verbs/initialized", 
            "Inicializado",
            { currentTime: video.currentTime },
            { "https://id.tincanapi.com/extension/video-length": video.duration }
        );
        
        enviarStatement(
            "http://adlnet.gov/expapi/verbs/played", 
            "Reproducido",
            { currentTime: video.currentTime }
        );
    });
    
// El statament del curso hasta la linea 167

    sendStatement({
        verb: "http://adlnet.gov/expapi/verbs/initialized",
        verbDisplay: { "en-US": "initialized" },
        object: {
          id: activityID,
          definition: {
            name: { "en-US": "Mi Curso XAPI" },
            description: { "en-US": "Descripción general del curso." }
          },
          objectType: "Activity"
        }
      });


    // Evento: Video pausado
    video.addEventListener("pause", function() {
        if (!video.ended) {  // No enviar pausa si es por final del video
            enviarStatement(
                "http://adlnet.gov/expapi/verbs/paused", 
                "Pausado",
                { currentTime: video.currentTime }
            );
            
            // Actualizar tiempo total cuando se pausa
            if (startTime) {
                var pauseTime = new Date();
                totalTimeWatched += (pauseTime - startTime) / 1000;
                startTime = null; // Reiniciar el tiempo de inicio
            }
        }
    });

        // Evento: Video pausado
    video.addEventListener("pause", function() {
        if (!video.ended) {  // No enviar pausa si es por final del video
            enviarStatement(
                "http://adlnet.gov/expapi/verbs/paused", 
                "Pausado",
                { currentTime: video.currentTime }
            );
            
            // Actualizar tiempo total cuando se pausa
            if (startTime) {
                var pauseTime = new Date();
                totalTimeWatched += (pauseTime - startTime) / 1000;
                startTime = null; // Reiniciar el tiempo de inicio
            }
        }
    });





        // Evento: Video completado

    video.addEventListener("ended", function() {
        if (startTime) {
            var endTime = new Date();
            totalTimeWatched += (endTime - startTime) / 1000;
            startTime = null;
        }
    
        // Statement adaptado al original
        enviarStatement(
            "http://adlnet.gov/expapi/verbs/completed",
            "Completado",
            {
                "completion": true,
                "success": false, // se puede ajustar según lógica de negocio
                "duration": totalTimeWatched,
                "currentTime": video.duration,
                "score": {
                    "scaled": 0,
                    "raw": 0,
                    "min": 0,
                    "max": 100
                }
            },
            {
                "https://id.tincanapi.com/extension/progress": 100
            }
        );
    });









    // Evento: Video finalizado
    video.addEventListener("ended", function() {
        // Actualizar tiempo total cuando termina
        if (startTime) {
            var endTime = new Date();
            totalTimeWatched += (endTime - startTime) / 1000;
            startTime = null;
        }
        
        // Enviar statement de finalización con todos los datos necesarios para SCORM Cloud
        enviarStatement(
            "http://adlnet.gov/expapi/verbs/completed",
            "Completado",
            {
                "completion": true,
                "success": true,
                "duration": totalTimeWatched,
                "currentTime": video.duration,
                "score": {
                    "scaled": 1.0,
                    "raw": 100,
                    "min": 0,
                    "max": 100
                }
            },
            {
                "https://id.tincanapi.com/extension/progress": 100
            }
        );
    });

    // Evento: Usuario adelanta o retrocede el video
    video.addEventListener("seeking", function() {
        enviarStatement(
            "http://id.tincanapi.com/verb/seeked", 
            "Desplazado",
            { currentTime: video.currentTime }
        );
    });

    // Monitoreo de progreso
    video.addEventListener("timeupdate", function() {
        var currentTime = Math.floor(video.currentTime);
        var porcentajeVisto = (video.currentTime / video.duration) * 100;
        
        // Enviar datos de progreso cada 10 segundos o en puntos clave
        if (currentTime - lastTimeUpdate >= 10 || 
            (porcentajeVisto >= 25 && porcentajeVisto < 26) || 
            (porcentajeVisto >= 50 && porcentajeVisto < 51) || 
            (porcentajeVisto >= 75 && porcentajeVisto < 76)) {
            
            enviarStatement(
                "http://adlnet.gov/expapi/verbs/progressed", 
                "Progresado",
                { 
                    currentTime: video.currentTime,
                    "progress": porcentajeVisto.toFixed(1)
                },
                {
                    "https://id.tincanapi.com/extension/progress": porcentajeVisto.toFixed(1)
                }
            );
            
            // Si llega al 50%, enviar un statement de experienced con completion parcial
            if (porcentajeVisto >= 50 && porcentajeVisto < 51) {
                enviarStatement(
                    "http://adlnet.gov/expapi/verbs/experienced",
                    "Experimentado 50%",
                    {
                        "completion": false,  // Aún no está completado totalmente
                        "duration": totalTimeWatched + ((new Date() - startTime) / 1000),
                        "progress": 50
                    }
                );
            }
            
            lastTimeUpdate = currentTime;
        }
    });

    // Manejo de errores
    video.addEventListener("error", function() {
        enviarStatement(
            "http://adlnet.gov/expapi/verbs/failed",
            "Error de reproducción",
            { "success": false }
        );
    });
    
    // Capturar cambios de volumen
    video.addEventListener("volumechange", function() {
        if (video.muted) {
            enviarStatement(
                "http://id.tincanapi.com/verb/muted",
                "Silenciado"
            );
        } else {
            enviarStatement(
                "http://id.tincanapi.com/verb/volumeChanged",
                "Volumen cambiado",
                {},
                { "https://id.tincanapi.com/extension/volume": video.volume }
            );
        }
    });
    
    // Cuando la página se cierra, enviar los datos finales de duración
    window.addEventListener("beforeunload", function() {
        // Actualizar tiempo total si el video estaba reproduciéndose
        if (startTime && !video.paused) {
            var closeTime = new Date();
            totalTimeWatched += (closeTime - startTime) / 1000;
            
            // Enviar statement de terminación con la duración acumulada
            enviarStatement(
                "http://adlnet.gov/expapi/verbs/terminated",
                "Sesión terminada",
                {
                    "duration": totalTimeWatched,
                    "completion": video.currentTime >= video.duration * 0.9,  // Considerar completado si vio el 90%
                    "success": video.currentTime >= video.duration * 0.9,     // Éxito basado en el mismo criterio
                    "progress": (video.currentTime / video.duration * 100).toFixed(1)
                }
            );
        }
    });
});