package com.smartcampus.smartcampus.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * SC-95 — Service d'envoi d'e-mails
 * Utilise JavaMailSender (SMTP réel ou simulé selon la configuration).
 * En mode développement, les e-mails sont simplement loggés si aucun SMTP n'est configuré.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@smartcampus.ma}")
    private String fromAddress;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Envoie le lien de réinitialisation de mot de passe.
     * SC-88 — Réinitialiser mot de passe oublié
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String subject = "[SmartCampus] Réinitialisation de votre mot de passe";
        String resetLink = "http://localhost:8083/api/auth/reset-password?token=" + resetToken;
        String body = String.format(
                "Bonjour,\n\n" +
                "Vous avez demandé la réinitialisation de votre mot de passe SmartCampus.\n\n" +
                "Cliquez sur le lien suivant (valable 15 minutes) :\n%s\n\n" +
                "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.\n\n" +
                "L'équipe SmartCampus",
                resetLink
        );

        sendEmail(toEmail, subject, body);
    }

    /**
     * Envoie un e-mail de confirmation d'inscription.
     * SC-86 — Créer un compte avec e-mail institutionnel
     */
    public void sendWelcomeEmail(String toEmail, String firstName) {
        String subject = "[SmartCampus] Bienvenue sur la plateforme !";
        String body = String.format(
                "Bonjour %s,\n\n" +
                "Votre compte SmartCampus a été créé avec succès.\n" +
                "Vous pouvez maintenant vous connecter avec votre adresse : %s\n\n" +
                "L'équipe SmartCampus",
                firstName, toEmail
        );

        sendEmail(toEmail, subject, body);
    }

    /**
     * Méthode interne d'envoi.
     * Si emailEnabled=false, l'e-mail est simplement loggé (mode test/simulation).
     */
    private void sendEmail(String to, String subject, String body) {
        if (!emailEnabled) {
            // Mode simulation : log l'e-mail sans l'envoyer
            log.info("=== [EMAIL SIMULÉ] ===");
            log.info("De      : {}", fromAddress);
            log.info("À       : {}", to);
            log.info("Sujet   : {}", subject);
            log.info("Contenu :\n{}", body);
            log.info("=====================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("E-mail envoyé à {}", to);
        } catch (Exception e) {
            log.error("Échec de l'envoi d'e-mail à {} : {}", to, e.getMessage());
            // On ne propage pas l'exception pour ne pas bloquer le flux principal
        }
    }
}
