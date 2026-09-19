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
import java.text.Normalizer;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

    /**
 * Responde a una pregunta libre sobre los gastos de un grupo.
 */
public String responderPregunta(Long grupoId, String pregunta) {

    List<Gasto> gastos = gastoRepository.list("grupo.id", grupoId);

    if (gastos == null || gastos.isEmpty()) {
        return "No hay gastos suficientes para responder a la pregunta.";
    }

    if (pregunta == null || pregunta.isBlank()) {
        return "Escribe una pregunta sobre los gastos.";
    }

    List<Gasto> gastosParaPregunta =
            seleccionarGastosSegunPregunta(gastos, pregunta);

    String contexto = construirContexto(gastosParaPregunta);

    return llamarIAPregunta(contexto, pregunta);
}

    /**
     * Filtra los gastos cuando la pregunta se refiere explícitamente
     * a un periodo temporal.
     *
     * Los filtros se realizan en Java para que la IA no tenga que
     * interpretar las fechas ni decidir qué gastos pertenecen al periodo.
     */
    private List<Gasto> seleccionarGastosSegunPregunta(
            List<Gasto> gastos,
            String pregunta) {

        String preguntaNormalizada = normalizarTexto(pregunta);

        LocalDate hoy = LocalDate.now(ZoneId.of("Europe/Madrid"));

        LocalDate inicio;
        LocalDate fin;

        if (preguntaNormalizada.contains("esta semana")) {

            inicio = hoy.with(
                    TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)
            );

            fin = inicio.plusDays(6);

        } else if (preguntaNormalizada.contains("semana pasada")) {

            inicio = hoy.with(
                    TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)
            ).minusDays(7);

            fin = inicio.plusDays(6);

        } else if (preguntaNormalizada.contains("este mes")) {

            inicio = hoy.withDayOfMonth(1);
            fin = hoy.with(
                    TemporalAdjusters.lastDayOfMonth()
            );

        } else if (preguntaNormalizada.contains("mes pasado")) {

            inicio = hoy.minusMonths(1).withDayOfMonth(1);

            fin = inicio.with(
                    TemporalAdjusters.lastDayOfMonth()
            );

        } else if (preguntaNormalizada.contains("hoy")) {

            inicio = hoy;
            fin = hoy;

        } else if (preguntaNormalizada.contains("ayer")) {

            inicio = hoy.minusDays(1);
            fin = inicio;

        } else {

            return gastos;
        }

        return gastos.stream()
                .filter(gasto -> {

                    if (gasto.fechaHora == null) {
                        return false;
                    }

                    LocalDate fecha = gasto.fechaHora.toLocalDate();

                    return !fecha.isBefore(inicio)
                            && !fecha.isAfter(fin);
                })
                .toList();
    }

    /**
     * Normaliza un texto para poder detectar periodos aunque el usuario
     * escriba las palabras con o sin tildes.
     */
    private String normalizarTexto(String texto) {

        String normalizado = Normalizer
                .normalize(texto, Normalizer.Form.NFD);

        return normalizado
                .replaceAll("\\p{M}", "")
                .toLowerCase();
    }
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

        LocalDate hoy = LocalDate.now(ZoneId.of("Europe/Madrid"));

        LocalDate inicioSemana =
                hoy.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        LocalDate finSemana =
                inicioSemana.plusDays(6);

        LocalDate inicioSemanaAnterior =
                inicioSemana.minusDays(7);

        LocalDate finSemanaAnterior =
                inicioSemana.minusDays(1);

        LocalDate inicioMes =
                hoy.withDayOfMonth(1);

        LocalDate finMes =
                hoy.with(TemporalAdjusters.lastDayOfMonth());

        LocalDate inicioMesAnterior =
                inicioMes.minusMonths(1);

        LocalDate finMesAnterior =
                inicioMes.minusDays(1);

        contexto.append("Analiza los siguientes gastos de un grupo familiar.\n\n");

        contexto.append("FECHA ACTUAL: ")
                .append(hoy.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .append("\n\n");

        contexto.append("TOTAL GASTADO EN TODOS LOS DATOS RECIBIDOS: ")
                .append(total)
                .append(" €\n");

        contexto.append("NÚMERO TOTAL DE GASTOS RECIBIDOS: ")
                .append(gastos.size())
                .append("\n\n");

        añadirDatosProyeccion(contexto, gastos, hoy);

        contexto.append("RESUMEN DE PERIODOS TEMPORALES CALCULADO POR EL SERVIDOR:\n\n");

        añadirResumenPeriodo(
                contexto,
                "ESTA SEMANA",
                inicioSemana,
                finSemana,
                gastos
        );

        añadirResumenPeriodo(
                contexto,
                "SEMANA PASADA",
                inicioSemanaAnterior,
                finSemanaAnterior,
                gastos
        );

        añadirResumenPeriodo(
                contexto,
                "ESTE MES",
                inicioMes,
                finMes,
                gastos
        );

        añadirResumenPeriodo(
                contexto,
                "MES PASADO",
                inicioMesAnterior,
                finMesAnterior,
                gastos
        );

        contexto.append("\nDETALLE COMPLETO DE TODOS LOS GASTOS:\n");

        List<Gasto> gastosOrdenados = gastos.stream()
                .sorted(Comparator.comparing(
                        g -> g.fechaHora != null
                                ? g.fechaHora
                                : LocalDateTime.MIN
                ))
                .toList();

        for (Gasto gasto : gastosOrdenados) {

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
     * Añade información objetiva que permite realizar proyecciones.
     * Los datos reales los calcula el servidor; la IA puede utilizarlos
     * para redactar una estimación cuando el usuario la solicite.
     */
    private void añadirDatosProyeccion(
            StringBuilder contexto,
            List<Gasto> gastos,
            LocalDate hoy) {

        LocalDate inicioMes = hoy.withDayOfMonth(1);
        LocalDate finMes = hoy.with(TemporalAdjusters.lastDayOfMonth());

        int diasDelMes = hoy.lengthOfMonth();
        int diaActual = hoy.getDayOfMonth();
        int diasRestantes = diasDelMes - diaActual;

        List<Gasto> gastosMesActual = gastos.stream()
                .filter(gasto -> {
                    if (gasto.fechaHora == null) {
                        return false;
                    }

                    LocalDate fecha = gasto.fechaHora.toLocalDate();

                    return !fecha.isBefore(inicioMes)
                            && !fecha.isAfter(hoy);
                })
                .toList();

        BigDecimal totalMesActual = gastosMesActual.stream()
                .map(g -> g.importe != null ? g.importe : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        contexto.append("DATOS PARA PROYECCIONES DEL MES ACTUAL:\n");
        contexto.append("- Mes actual: ")
                .append(hoy.format(DateTimeFormatter.ofPattern("MM/yyyy")))
                .append("\n");
        contexto.append("- Primer día del mes: ")
                .append(inicioMes.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .append("\n");
        contexto.append("- Último día del mes: ")
                .append(finMes.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .append("\n");
        contexto.append("- Días del mes: ")
                .append(diasDelMes)
                .append("\n");
        contexto.append("- Día del mes actual: ")
                .append(diaActual)
                .append("\n");
        contexto.append("- Días restantes del mes: ")
                .append(diasRestantes)
                .append("\n");
        contexto.append("- Total gastado desde el día 1 hasta hoy: ")
                .append(totalMesActual)
                .append(" €\n");
        contexto.append("- Número de gastos desde el día 1 hasta hoy: ")
                .append(gastosMesActual.size())
                .append("\n");

        Map<String, BigDecimal> totalesPorCategoria = new LinkedHashMap<>();

        for (Gasto gasto : gastosMesActual) {

            String categoria = gasto.categoria != null
                    ? gasto.categoria.toString()
                    : "SIN CATEGORÍA";

            BigDecimal importe =
                    gasto.importe != null
                            ? gasto.importe
                            : BigDecimal.ZERO;

            totalesPorCategoria.merge(
                    categoria,
                    importe,
                    BigDecimal::add
            );
        }

        if (!totalesPorCategoria.isEmpty()) {

            contexto.append("- Gasto acumulado por categoría desde el día 1 hasta hoy:\n");

            totalesPorCategoria.forEach((categoria, importe) ->
                    contexto.append("  - ")
                            .append(categoria)
                            .append(": ")
                            .append(importe)
                            .append(" €\n")
            );
        }

        contexto.append("\n");
    }

    /**
     * Añade al contexto un periodo calculado por el servidor.
     * Las fechas son inclusivas.
     */
    private void añadirResumenPeriodo(
            StringBuilder contexto,
            String nombre,
            LocalDate inicio,
            LocalDate fin,
            List<Gasto> gastos) {

        List<Gasto> gastosPeriodo = gastos.stream()
                .filter(gasto -> {

                    if (gasto.fechaHora == null) {
                        return false;
                    }

                    LocalDate fecha = gasto.fechaHora.toLocalDate();

                    return !fecha.isBefore(inicio)
                            && !fecha.isAfter(fin);
                })
                .sorted(Comparator.comparing(
                        gasto -> gasto.fechaHora
                ))
                .toList();

        BigDecimal totalPeriodo = gastosPeriodo.stream()
                .map(g -> g.importe != null ? g.importe : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        contexto.append(nombre)
                .append(" (")
                .append(inicio.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .append(" - ")
                .append(fin.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .append("):\n");

        contexto.append("- Número de gastos: ")
                .append(gastosPeriodo.size())
                .append("\n");

        contexto.append("- Total: ")
                .append(totalPeriodo)
                .append(" €\n");

        if (gastosPeriodo.isEmpty()) {
            contexto.append("- No hay gastos en este periodo.\n\n");
            return;
        }

        contexto.append("- Gastos del periodo:\n");

        for (Gasto gasto : gastosPeriodo) {

            contexto.append("  - ");

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

            contexto.append(" | Fecha: ")
                    .append(gasto.fechaHora.format(FORMATO_FECHA))
                    .append("\n");
        }

        contexto.append("\n");
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
 * Envía una pregunta libre junto con los gastos a la IA.
 */
private String llamarIAPregunta(String contexto, String pregunta) {

    String apiKey = System.getenv("OPENAI_API_KEY");

    if (apiKey == null || apiKey.isBlank()) {
        return "No se ha configurado la clave de la inteligencia artificial.";
    }

    try {

        String prompt = """
                Eres un asistente especializado en analizar gastos familiares.

                El usuario te hará una pregunta sobre los gastos proporcionados.

                Responde exclusivamente utilizando los datos recibidos.
                No inventes ningún dato.
                Si la información necesaria para responder no aparece en los datos,
                indícalo claramente.

                IMPORTANTE PARA LAS FECHAS Y LOS TOTALES:
                - La FECHA ACTUAL y los periodos temporales han sido calculados por el servidor.
                - Cuando la pregunta se refiere a un periodo temporal concreto, el servidor
                  puede haber filtrado previamente los datos para dejar únicamente los gastos
                  de ese periodo.
                - Si los datos recibidos están filtrados para el periodo de la pregunta,
                  utiliza exclusivamente esos datos.
                - Si el usuario pregunta por "esta semana", utiliza exclusivamente el bloque
                  ESTA SEMANA y sus gastos.
                - Si pregunta por "la semana pasada", utiliza exclusivamente SEMANA PASADA.
                - Si pregunta por "este mes", utiliza exclusivamente ESTE MES.
                - Si pregunta por "el mes pasado", utiliza exclusivamente MES PASADO.
                - No presentes el TOTAL GASTADO EN TODOS LOS DATOS como si fuera el total
                  del periodo que pregunta el usuario.
                - Para cantidades y números de gastos, utiliza los valores calculados por
                  el servidor. No vuelvas a estimarlos ni los sustituyas por otros.
                - Si el usuario pide una predicción, previsión o estimación, sí debes realizarla
                  utilizando los datos disponibles. No respondas simplemente que no hay datos
                  suficientes si existe información histórica o acumulada que permita hacer una
                  proyección razonable.
                - Distingue siempre entre datos reales y estimaciones. Indica claramente que una
                  previsión es aproximada.
                - Para proyectar el gasto de un mes, puedes utilizar el gasto acumulado hasta hoy,
                  los días transcurridos, los días restantes y el número total de días del mes.
                - Si la pregunta se refiere a una categoría concreta, utiliza el gasto acumulado
                  de esa categoría que aparece en los datos del servidor y explica brevemente
                  el criterio de proyección utilizado.
                - No conviertas una estimación en un dato real ni afirmes que se gastará exactamente
                  esa cantidad.

                Responde en español de forma clara y natural.
                Puedes utilizar Markdown cuando ayude a organizar la respuesta.

                PREGUNTA DEL USUARIO:

                %s

                DATOS DE LOS GASTOS:

                %s
                """.formatted(pregunta, contexto);

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
        return "Error al realizar la consulta: " + e.getMessage();
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