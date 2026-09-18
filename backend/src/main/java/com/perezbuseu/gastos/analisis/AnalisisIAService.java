package com.perezbuseu.gastos.analisis;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.perezbuseu.gastos.gasto.Gasto;
import com.perezbuseu.gastos.gasto.GastoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.format.DateTimeFormatter;
import java.util.List;

@ApplicationScoped
public class AnalisisIAService {

    @Inject
    GastoRepository gastoRepository;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private static final DateTimeFormatter FORMATO_FECHA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Analiza los gastos de un grupo mediante inteligencia artificial.
     */
    public String analizarGastos(Long grupoId) {

        List<Gasto> gastos = gastoRepository.list("grupo.id", grupoId);

        if (gastos == null || gastos.isEmpty()) {
            return "No hay gastos suficientes para realizar un análisis.";
        }

        String contexto = construirContexto(gastos);

        return llamarIA(contexto);
    }

    /**
     * Construye un contexto resumido con los datos necesarios
     * para que la IA pueda analizar los gastos.
     */
    private String construirContexto(List<Gasto> gastos) {

        BigDecimal total = gastos.stream()
                .map(g -> g.importe != null ? g.importe : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        StringBuilder contexto = new StringBuilder();

        contexto.append("Analiza los siguientes gastos de un grupo familiar.\n\n");

        contexto.append("TOTAL GASTADO: ")
                .append(total)
                .append(" €\n");

        contexto.append("NÚMERO DE GASTOS: ")
                .append(gastos.size())
                .append("\n\n");

        contexto.append("DETALLE DE LOS GASTOS:\n");

        for (Gasto gasto : gastos) {

            contexto.append("- ");

            if (gasto.descripcion != null) {
                contexto.append(gasto.descripcion);
            }

            contexto.append(" | Importe: ")
                    .append(gasto.importe != null ? gasto.importe : BigDecimal.ZERO)
                    .append(" €");

            if (gasto.categoria != null) {
                contexto.append(" | Categoría: ")
                        .append(gasto.categoria);
            }

            if (gasto.pagador != null && gasto.pagador.nombre != null) {
                contexto.append(" | Pagador: ")
                        .append(gasto.pagador.nombre);
            }

            if (gasto.fechaHora != null) {
                contexto.append(" | Fecha: ")
                        .append(gasto.fechaHora.format(FORMATO_FECHA));
            }

            contexto.append("\n");
        }

        return contexto.toString();
    }

    /**
     * Envía el contexto a la IA.
     */
    private String llamarIA(String contexto) {

        String apiKey = System.getenv("OPENAI_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            return "No se ha configurado la clave de la inteligencia artificial.";
        }

        try {

            String prompt = """
                    Eres un asistente especializado en analizar gastos familiares.

                    Analiza los datos proporcionados y genera un informe claro
                    y útil en español.

                    Incluye, cuando los datos lo permitan:

                    - Total gastado.
                    - Número de gastos.
                    - Categorías con mayor gasto.
                    - Comercios o conceptos donde más se ha gastado.
                    - Personas que han pagado más.
                    - Evolución mensual.
                    - Gastos especialmente elevados.
                    - Observaciones o patrones interesantes.

                    No inventes ningún dato que no aparezca en la información recibida.

                    DATOS DE LOS GASTOS:

                    %s
                    """.formatted(contexto);

            String json = """
                    {
                      "model": "gpt-4o-mini",
                      "messages": [
                        {
                          "role": "system",
                          "content": "Eres un asistente especializado en análisis de gastos familiares."
                        },
                        {
                          "role": "user",
                          "content": %s
                        }
                      ]
                    }
                    """.formatted(escaparJson(prompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return "Error al consultar la inteligencia artificial. Código: "
                        + response.statusCode();
            }

            return extraerRespuesta(response.body());

        } catch (Exception e) {
            return "Error al realizar el análisis: " + e.getMessage();
        }
    }

    /**
     * Escapa texto para introducirlo correctamente en JSON.
     */
    private String escaparJson(String texto) {

        return "\"" + texto
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t")
                + "\"";
    }

    /**
     * Extrae el contenido de la respuesta de OpenAI.
     */
    private String extraerRespuesta(String respuesta) {

        try {

            ObjectMapper objectMapper = new ObjectMapper();

            JsonNode root = objectMapper.readTree(respuesta);

            JsonNode content =
                    root.path("choices")
                            .path(0)
                            .path("message")
                            .path("content");

            if (content.isMissingNode() || content.isNull()) {
                return "La inteligencia artificial no devolvió una respuesta válida.";
            }

            return content.asText();

        } catch (Exception e) {

            return "No se pudo interpretar la respuesta de la inteligencia artificial.";

        }
    }
}