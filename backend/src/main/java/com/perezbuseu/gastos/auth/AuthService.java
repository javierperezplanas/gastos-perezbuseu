package com.perezbuseu.gastos.auth;

import com.perezbuseu.gastos.auth.dto.LoginRequest;
import com.perezbuseu.gastos.auth.dto.LoginResponse;
import com.perezbuseu.gastos.auth.dto.RegisterRequest;

import com.perezbuseu.gastos.usuario.Usuario;
import com.perezbuseu.gastos.usuario.UsuarioRepository;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;

import java.nio.charset.StandardCharsets;

import java.security.MessageDigest;
import java.security.SecureRandom;

import java.time.LocalDateTime;

import java.util.Base64;


@ApplicationScoped
public class AuthService {


    @Inject
    UsuarioRepository usuarioRepository;


    @Inject
    PasswordResetTokenRepository
            passwordResetTokenRepository;


    @Inject
    PasswordService passwordService;


    @Inject
    Mailer mailer;


    @ConfigProperty(
            name = "app.public-url"
    )
    String publicUrl;


    private final SecureRandom secureRandom =
            new SecureRandom();


    /*
     * =========================
     * LOGIN
     * =========================
     */

    @Transactional
    public LoginResponse login(
            LoginRequest request
    ) {

        String email =
                request.email
                        .trim()
                        .toLowerCase();


        Usuario usuario =
                usuarioRepository.buscarPorEmail(
                        email
                );


        if (usuario == null) {

            throw new NotAuthorizedException(
                    "Email o contraseña incorrectos"
            );

        }


        if (
                !passwordService.matches(
                        request.password,
                        usuario.password
                )
        ) {

            throw new NotAuthorizedException(
                    "Email o contraseña incorrectos"
            );

        }


        /*
         * Si es un usuario antiguo cuya
         * contraseña estaba en texto plano,
         * la convertimos ahora a hash.
         */
        if (
                passwordService.isLegacyPassword(
                        usuario.password
                )
        ) {

            usuario.password =
                    passwordService.hash(
                            request.password
                    );

        }


        return new LoginResponse(
                usuario.id,
                usuario.nombre,
                usuario.email
        );

    }


    /*
     * =========================
     * REGISTRO
     * =========================
     */

    @Transactional
    public LoginResponse register(
            RegisterRequest request
    ) {

        if (
                request.nombre == null
                ||
                request.nombre.trim().isEmpty()
        ) {

            throw new BadRequestException(
                    "El nombre es obligatorio"
            );

        }


        if (
                request.email == null
                ||
                request.email.trim().isEmpty()
        ) {

            throw new BadRequestException(
                    "El email es obligatorio"
            );

        }


        if (
                request.password == null
                ||
                request.password.trim().isEmpty()
        ) {

            throw new BadRequestException(
                    "La contraseña es obligatoria"
            );

        }


        String email =
                request.email
                        .trim()
                        .toLowerCase();


        Usuario usuarioExistente =
                usuarioRepository.buscarPorEmail(
                        email
                );


        if (usuarioExistente != null) {

            throw new BadRequestException(
                    "Ya existe un usuario con ese email"
            );

        }


        Usuario usuario =
                new Usuario();


        usuario.nombre =
                request.nombre.trim();


        usuario.email =
                email;


        /*
         * NUEVO: las nuevas contraseñas
         * siempre se guardan con hash.
         */
        usuario.password =
                passwordService.hash(
                        request.password
                );


        usuarioRepository.persist(
                usuario
        );


        return new LoginResponse(
                usuario.id,
                usuario.nombre,
                usuario.email
        );

    }


    /*
     * =========================
     * SOLICITAR RESET
     * =========================
     */

    @Transactional
    public void solicitarResetPassword(
            String email
    ) {

        if (
                email == null
                ||
                email.trim().isEmpty()
        ) {

            throw new BadRequestException(
                    "El email es obligatorio"
            );

        }


        String emailNormalizado =
                email.trim().toLowerCase();


        Usuario usuario =
                usuarioRepository.buscarPorEmail(
                        emailNormalizado
                );


        /*
         * No revelamos si el email existe
         * o no.
         */
        if (usuario == null) {

            return;

        }


        /*
         * Invalidamos tokens anteriores.
         */
        passwordResetTokenRepository.delete(
                "usuario = ?1 and usedAt is null",
                usuario
        );


        byte[] bytes =
                new byte[32];


        secureRandom.nextBytes(
                bytes
        );


        String token =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(
                                bytes
                        );


        PasswordResetToken resetToken =
                new PasswordResetToken();


        resetToken.usuario =
                usuario;


        resetToken.tokenHash =
                sha256(token);


        resetToken.expiresAt =
                LocalDateTime.now()
                        .plusMinutes(30);


        resetToken.usedAt =
                null;


        passwordResetTokenRepository.persist(
                resetToken
        );


        String enlace =
                publicUrl
                + "/restablecer-password?token="
                + token;


        String nombre =
                usuario.nombre != null
                        ? usuario.nombre
                        : "";


        String texto =
                "Hola "
                + nombre
                + ",\n\n"
                + "Has solicitado restablecer "
                + "tu contraseña de Gastos PerezBuseu.\n\n"
                + "Pulsa el siguiente enlace para "
                + "crear una nueva contraseña:\n\n"
                + enlace
                + "\n\n"
                + "El enlace caduca en 30 minutos "
                + "y solo puede utilizarse una vez.\n\n"
                + "Si no has solicitado este cambio, "
                + "puedes ignorar este correo.\n\n"
                + "Gastos PerezBuseu";


        mailer.send(
                Mail.withText(
                        usuario.email,
                        "Restablecer contraseña - Gastos PerezBuseu",
                        texto
                )
        );

    }


    /*
     * =========================
     * RESTABLECER CONTRASEÑA
     * =========================
     */

    @Transactional
    public void restablecerPassword(
            String token,
            String password
    ) {

        if (
                token == null
                ||
                token.trim().isEmpty()
        ) {

            throw new BadRequestException(
                    "El enlace no es válido"
            );

        }


        if (
                password == null
                ||
                password.length() < 6
        ) {

            throw new BadRequestException(
                    "La contraseña debe tener al menos 6 caracteres"
            );

        }


        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .buscarPorHash(
                                sha256(token)
                        );


        if (resetToken == null) {

            throw new BadRequestException(
                    "El enlace no es válido"
            );

        }


        if (
                resetToken.usedAt != null
        ) {

            throw new BadRequestException(
                    "El enlace ya ha sido utilizado"
            );

        }


        if (
                resetToken.expiresAt == null
                ||
                resetToken.expiresAt
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {

            throw new BadRequestException(
                    "El enlace ha caducado"
            );

        }


        resetToken.usuario.password =
                passwordService.hash(
                        password
                );


        resetToken.usedAt =
                LocalDateTime.now();

    }


    /*
     * =========================
     * SHA-256
     * =========================
     */

    private String sha256(
            String value
    ) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );


            byte[] hash =
                    digest.digest(
                            value.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );


            return Base64.getEncoder()
                    .encodeToString(
                            hash
                    );

        }

        catch (Exception e) {

            throw new IllegalStateException(
                    "No se ha podido generar el hash del token",
                    e
            );

        }

    }

}