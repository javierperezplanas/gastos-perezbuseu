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


        if (
                participantesIds == null
                ||
                participantesIds.isEmpty()
        ) {

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
        if (
                tipoDivision == null
                ||
                tipoDivision.isBlank()
        ) {

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
        if (
                tipoDivision.equals(
                        "TOTAL_A_PAGADOR"
                )
        ) {


            List<Usuario> deudores =
                    new ArrayList<>();


            for (
                    Usuario usuario
                    : participantes
            ) {

                if (
                        !usuario.id.equals(
                                pagador.id
                        )
                ) {

                    deudores.add(
                            usuario
                    );

                }

            }


            /*
             * Si no hay otros participantes,
             * el pagador asume el gasto.
             */
            if (
                    deudores.isEmpty()
            ) {

                guardarReparto(
                        gasto,
                        pagador,
                        gasto.importe
                );

                return;

            }


            /*
             * El pagador no participa
             * en este reparto.
             *
             * Los céntimos sobrantes
             * se distribuyen entre
             * los deudores.
             */
            dividirEntreUsuarios(
                    gasto,
                    deudores,
                    null
            );


            return;

        }


        /*
         * IGUAL
         *
         * Se divide entre todos
         * los participantes.
         *
         * IMPORTANTE:
         *
         * Si sobra algún céntimo,
         * se reparte primero entre
         * los participantes que
         * NO son el pagador.
         *
         * De esta forma el redondeo
         * favorece al pagador.
         */
        dividirEntreUsuarios(
                gasto,
                participantes,
                pagador
        );

    }


    /*
     * Elimina todos los repartos
     * de un gasto.
     */
    @Transactional
    public void eliminarRepartosDeGasto(
            Long gastoId
    ) {


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
     *
     * Si existe un pagador dentro
     * del reparto, los céntimos
     * sobrantes se asignan primero
     * a los demás participantes.
     *
     * Así el redondeo favorece
     * al pagador.
     */
    private void dividirEntreUsuarios(
            Gasto gasto,
            List<Usuario> usuarios,
            Usuario pagador
    ) {


        int numeroUsuarios =
                usuarios.size();


        if (
                numeroUsuarios == 0
        ) {

            throw new IllegalArgumentException(
                    "No hay usuarios para repartir el gasto"
            );

        }


        /*
         * Convertimos el importe
         * completo a céntimos.
         *
         * Ejemplo:
         *
         * 40,95 €
         *
         * = 4095 céntimos
         */
        int totalCentimos =
                gasto.importe
                        .movePointRight(2)
                        .intValueExact();


        /*
         * Parte base para cada
         * participante.
         *
         * Ejemplo:
         *
         * 4095 / 2 = 2047
         */
        int centimosBase =
                totalCentimos
                        /
                        numeroUsuarios;


        /*
         * Céntimos que sobran
         * después de dividir.
         *
         * Ejemplo:
         *
         * 4095 % 2 = 1
         */
        int restoCentimos =
                totalCentimos
                        %
                        numeroUsuarios;


        /*
         * Guardamos los céntimos
         * extra que recibirá
         * cada usuario.
         */
        int[] centimosExtra =
                new int[
                        numeroUsuarios
                ];


        /*
         * PRIMERA PASADA
         *
         * Repartimos los céntimos
         * sobrantes entre los usuarios
         * que NO son el pagador.
         *
         * Esto hace que el redondeo
         * favorezca al pagador.
         */
        for (
                int i = 0;
                i < numeroUsuarios;
                i++
        ) {


            if (
                    restoCentimos <= 0
            ) {

                break;

            }


            /*
             * Si hay pagador y este
             * usuario es el pagador,
             * lo dejamos para el final.
             */
            if (

                    pagador != null

                    &&

                    usuarios.get(i).id.equals(
                            pagador.id
                    )

            ) {

                continue;

            }


            centimosExtra[i]++;


            restoCentimos--;

        }


        /*
         * SEGUNDA PASADA
         *
         * Normalmente no será necesaria.
         *
         * Solo se ejecuta si todavía
         * quedan céntimos por repartir.
         *
         * En ese caso se pueden
         * asignar también al pagador.
         */
        for (
                int i = 0;
                i < numeroUsuarios;
                i++
        ) {


            if (
                    restoCentimos <= 0
            ) {

                break;

            }


            centimosExtra[i]++;


            restoCentimos--;

        }


        /*
         * Guardamos los repartos.
         */
        for (
                int i = 0;
                i < numeroUsuarios;
                i++
        ) {


            int centimos =
                    centimosBase
                            +
                            centimosExtra[i];


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
            List<Long> participantesIds
    ) {


        List<Usuario> participantes =
                new ArrayList<>();


        for (
                Long usuarioId
                : participantesIds
        ) {


            Usuario usuario =
                    usuarioRepository.findById(
                            usuarioId
                    );


            if (
                    usuario == null
            ) {

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
            BigDecimal importe
    ) {


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
            int centimos
    ) {


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