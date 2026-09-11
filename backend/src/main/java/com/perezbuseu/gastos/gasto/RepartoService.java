package com.perezbuseu.gastos.gasto;

import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;


@ApplicationScoped
public class RepartoService {


    @Inject
    RepartoGastoRepository repartoGastoRepository;


    @Inject
    UsuarioRepository usuarioRepository;


    /*
     * Crea los repartos de un gasto
     * entre los participantes.
     *
     * tipoDivision:
     *
     * IGUAL
     * TOTAL_A_PAGADOR
     */
    @Transactional
    public void crearRepartos(
            Gasto gasto,
            List<Long> participantesIds,
            Usuario pagador,
            String tipoDivision) {


        if (participantesIds == null
                || participantesIds.isEmpty()) {

            throw new IllegalArgumentException(
                    "Debe haber al menos un participante"
            );

        }


        List<Usuario> participantes =
                obtenerParticipantes(
                        participantesIds
                );


        /*
         * Si no se recibe ningún tipo,
         * usamos IGUAL por defecto.
         */
        if (tipoDivision == null
                || tipoDivision.isBlank()) {

            tipoDivision = "IGUAL";

        }


        /*
         * TOTAL_A_PAGADOR
         *
         * El pagador adelanta el dinero,
         * pero NO participa en el reparto.
         *
         * El importe se divide entre
         * el resto de participantes.
         */
        if (tipoDivision.equals("TOTAL_A_PAGADOR")) {


            List<Usuario> deudores =
                    new ArrayList<>();


            for (Usuario usuario : participantes) {

                if (!usuario.id.equals(pagador.id)) {

                    deudores.add(usuario);

                }

            }


            /*
             * Si no hay otros participantes,
             * el pagador asume el gasto.
             */
            if (deudores.isEmpty()) {

                guardarReparto(
                        gasto,
                        pagador,
                        gasto.importe
                );

                return;

            }


            dividirEntreUsuarios(
                    gasto,
                    deudores
            );


            return;

        }


        /*
         * IGUAL
         *
         * Se divide entre todos
         * los participantes.
         */
        dividirEntreUsuarios(
                gasto,
                participantes
        );

    }


    /*
     * Elimina todos los repartos
     * de un gasto.
     */
    @Transactional
    public void eliminarRepartosDeGasto(
            Long gastoId) {


        repartoGastoRepository.delete(
                "gasto.id",
                gastoId
        );

    }


    /*
     * Divide un gasto entre
     * una lista de usuarios.
     *
     * Se trabaja en céntimos para
     * evitar problemas de decimales.
     */
    private void dividirEntreUsuarios(
            Gasto gasto,
            List<Usuario> usuarios) {


        int numeroUsuarios =
                usuarios.size();


        if (numeroUsuarios == 0) {

            throw new IllegalArgumentException(
                    "No hay usuarios para repartir el gasto"
            );

        }


        int totalCentimos =
                gasto.importe
                        .movePointRight(2)
                        .intValueExact();


        int centimosBase =
                totalCentimos
                        / numeroUsuarios;


        int restoCentimos =
                totalCentimos
                        % numeroUsuarios;


        /*
         * Repartimos los céntimos
         * restantes entre los primeros
         * usuarios de la lista.
         *
         * Así garantizamos que la suma
         * sea exactamente igual al importe.
         */
        for (int i = 0;
             i < numeroUsuarios;
             i++) {


            int centimos =
                    centimosBase;


            if (i < restoCentimos) {

                centimos++;

            }


            guardarReparto(
                    gasto,
                    usuarios.get(i),
                    centimos
            );

        }

    }


    /*
     * Busca y devuelve los usuarios
     * participantes.
     */
    private List<Usuario> obtenerParticipantes(
            List<Long> participantesIds) {


        List<Usuario> participantes =
                new ArrayList<>();


        for (Long usuarioId : participantesIds) {


            Usuario usuario =
                    usuarioRepository.findById(
                            usuarioId
                    );


            if (usuario == null) {

                throw new IllegalArgumentException(
                        "Usuario no encontrado: "
                                + usuarioId
                );

            }


            participantes.add(
                    usuario
            );

        }


        return participantes;

    }


    /*
     * Guarda un reparto usando
     * un importe directamente.
     */
    private void guardarReparto(
            Gasto gasto,
            Usuario usuario,
            BigDecimal importe) {


        RepartoGasto reparto =
                new RepartoGasto();


        reparto.gasto =
                gasto;


        reparto.usuario =
                usuario;


        reparto.importe =
                importe
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );


        repartoGastoRepository.persist(
                reparto
        );

    }


    /*
     * Guarda un reparto
     * a partir de céntimos.
     */
    private void guardarReparto(
            Gasto gasto,
            Usuario usuario,
            int centimos) {


        BigDecimal importe =

                BigDecimal.valueOf(
                        centimos
                )
                .movePointLeft(2)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );


        guardarReparto(
                gasto,
                usuario,
                importe
        );

    }


}
