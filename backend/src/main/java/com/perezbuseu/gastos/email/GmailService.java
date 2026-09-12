package com.perezbuseu.gastos.email;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;

import jakarta.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Properties;

import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;


@ApplicationScoped
public class GmailService {

    @ConfigProperty(name = "google.gmail.client-id")
    String clientId;

    @ConfigProperty(name = "google.gmail.client-secret")
    String clientSecret;


    public void enviarCorreo(
            String destinatario,
            String asunto,
            String texto
    ) {

        /*
         * De momento dejamos preparado
         * el servicio.
         *
         * El siguiente paso será añadir
         * OAuth2 y obtener el token.
         */

        try {

            Properties properties =
                    new Properties();

            Session session =
                    Session.getDefaultInstance(
                            properties
                    );


            MimeMessage email =
                    new MimeMessage(
                            session
                    );


            email.setFrom(
                    new InternetAddress(
                            "gastosperezbuseu@gmail.com"
                    )
            );


            email.setRecipient(
                    MimeMessage.RecipientType.TO,
                    new InternetAddress(
                            destinatario
                    )
            );


            email.setSubject(
                    asunto,
                    "UTF-8"
            );


            email.setText(
                    texto,
                    "UTF-8"
            );


            ByteArrayOutputStream buffer =
                    new ByteArrayOutputStream();


            email.writeTo(
                    buffer
            );


            String emailCodificado =
                    Base64.getUrlEncoder()
                            .withoutPadding()
                            .encodeToString(
                                    buffer.toByteArray()
                            );


            Message mensaje =
                    new Message();

            mensaje.setRaw(
                    emailCodificado
            );


            /*
             * Aquí todavía no enviamos.
             *
             * En el siguiente paso crearemos
             * el cliente Gmail autenticado
             * mediante OAuth2.
             */

            System.out.println(
                    "Correo preparado para: "
                    + destinatario
            );


        } catch (Exception e) {

            throw new RuntimeException(
                    "Error preparando el correo",
                    e
            );

        }

    }

}
