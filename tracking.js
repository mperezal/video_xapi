document.addEventListener("DOMContentLoaded", function() {
  // Seleccionar el video después de que el DOM haya cargado
  var video = document.getElementById("myVideo");

  if (!video) {
      console.error("Error: No se encontró el elemento de video.");
      return;
  }

  console.log("✅ Video encontrado correctamente.");

  // Configuración del LRS
  var conf = {
      endpoint: "https://cloud.scorm.com/lrs/VVIL00T1VK/sandbox/",
      auth: "Basic " + btoa("lrABLGNivmg_RtIBo6o:zE7laxLVNQMOsvF_O9Y")
  };
  ADL.XAPIWrapper.changeConfig(conf);

  // Función para enviar xAPI Statements con tiempo
  function enviarStatement(verb, description, timestamp = null) {
      var statement = {
          "actor": {
              "mbox": "mailto:usuario@ejemplo.com",
              "name": "Usuario Ejemplo",
              "objectType": "Agent"
          },
          "verb": {
              "id": verb,
              "display": { "en-US": description }
          },
          "object": {
              "id": "https://tudominio.com/xapi/video/cliente",
              "definition": {
                  "name": { "en-US": "Video de Cliente" },
                  "description": { "en-US": "Un video del cliente que se está observando." }
              },
              "objectType": "Activity"
          },
          "result": {
              "extensions": {
                  "https://id.tincanapi.com/extension/time-watched": timestamp
              }
          }
      };

      ADL.XAPIWrapper.sendStatement(statement, function(resp, obj) {
          console.log("📤 Statement enviado:", description, "Tiempo:", timestamp, "segundos");
      });
  }

  // Evento: Video comienza
  video.addEventListener("play", function() {
      enviarStatement("http://adlnet.gov/expapi/verbs/played", "Video comenzado", video.currentTime);
  });

  // Evento: Video pausado
  video.addEventListener("pause", function() {
      enviarStatement("http://adlnet.gov/expapi/verbs/paused", "Video pausado", video.currentTime);
  });

  // Evento: Video finalizado
  video.addEventListener("ended", function() {
      enviarStatement("http://adlnet.gov/expapi/verbs/completed", "Video completado", video.duration);
  });

  // Evento: Usuario adelanta o retrocede el video
  var lastTime = 0;
  video.addEventListener("timeupdate", function() {
      var porcentajeVisto = (video.currentTime / video.duration) * 100;

      // Solo enviamos datos cada 5 segundos para evitar sobrecarga
      if (Math.abs(video.currentTime - lastTime) >= 5) {
          enviarStatement("http://id.tincanapi.com/verb/seeked", "Video adelantado/retrocedido", video.currentTime);
          lastTime = video.currentTime;
      }

      // Si el usuario ha visto el 50% del video, enviar un statement
      if (porcentajeVisto >= 50 && porcentajeVisto < 55) {
          enviarStatement("http://id.tincanapi.com/verb/progressed", "Video 50% visto", video.currentTime);
      }
  });
});
