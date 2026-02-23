package com.kredia.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = "http://localhost:8086/reset-password.html?token=" + token;
        String subject = "Kredia - Reset Your Password";
        String content = "<h3>Password Reset Request</h3>" +
                "<p>We received a request to reset your password for your Kredia account.</p>" +
                "<p>Click the link below to set a new password. This link is valid for 24 hours.</p>" +
                "<a href=\"" + resetUrl + "\">Reset My Password</a>" +
                "<p>If you did not request this, please ignore this email.</p>";

        sendHtmlEmail(to, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(Objects.requireNonNull(to, "to"));
            helper.setSubject(Objects.requireNonNull(subject, "subject"));
            helper.setText(Objects.requireNonNull(body, "body"), true);
            helper.setFrom("support@kredia.com");
            mailSender.send(message);
        } catch (MessagingException e) {
            // In a production environment, we should use a proper logging framework
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
