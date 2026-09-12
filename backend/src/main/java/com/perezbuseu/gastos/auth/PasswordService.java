package com.perezbuseu.gastos.auth;

import jakarta.enterprise.context.ApplicationScoped;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import java.security.MessageDigest;
import java.security.SecureRandom;

import java.util.Base64;


@ApplicationScoped
public class PasswordService {

    private static final String PREFIX = "PBKDF2";

    private static final int ITERATIONS = 210000;

    private static final int KEY_LENGTH = 256;

    private static final int SALT_LENGTH = 16;

    private final SecureRandom secureRandom =
            new SecureRandom();


    public String hash(String password) {

        try {

            byte[] salt =
                    new byte[SALT_LENGTH];

            secureRandom.nextBytes(salt);

            byte[] hash =
                    derive(
                            password,
                            salt,
                            ITERATIONS
                    );

            return PREFIX
                    + "$"
                    + ITERATIONS
                    + "$"
                    + Base64.getEncoder()
                        .encodeToString(salt)
                    + "$"
                    + Base64.getEncoder()
                        .encodeToString(hash);

        } catch (Exception e) {

            throw new IllegalStateException(
                    "No se ha podido proteger la contraseña",
                    e
            );
        }
    }


    public boolean matches(
            String password,
            String storedPassword
    ) {

        if (
                password == null
                ||
                storedPassword == null
        ) {
            return false;
        }


        /*
         * Compatibilidad con usuarios antiguos
         * que todavía tengan la contraseña
         * almacenada en texto plano.
         */
        if (
                !storedPassword.startsWith(
                        PREFIX + "$"
                )
        ) {

            return password.equals(
                    storedPassword
            );
        }


        try {

            String[] parts =
                    storedPassword.split("\\$");

            if (parts.length != 4) {
                return false;
            }

            int iterations =
                    Integer.parseInt(parts[1]);

            byte[] salt =
                    Base64.getDecoder()
                            .decode(parts[2]);

            byte[] expected =
                    Base64.getDecoder()
                            .decode(parts[3]);

            byte[] actual =
                    derive(
                            password,
                            salt,
                            iterations
                    );

            return MessageDigest.isEqual(
                    expected,
                    actual
            );

        } catch (Exception e) {

            return false;
        }
    }


    public boolean isLegacyPassword(
            String storedPassword
    ) {

        return storedPassword != null
                &&
                !storedPassword.startsWith(
                        PREFIX + "$"
                );
    }


    private byte[] derive(
            String password,
            byte[] salt,
            int iterations
    ) throws Exception {

        PBEKeySpec spec =
                new PBEKeySpec(
                        password.toCharArray(),
                        salt,
                        iterations,
                        KEY_LENGTH
                );

        try {

            SecretKeyFactory factory =
                    SecretKeyFactory.getInstance(
                            "PBKDF2WithHmacSHA256"
                    );

            return factory
                    .generateSecret(spec)
                    .getEncoded();

        } finally {

            spec.clearPassword();
        }
    }
}