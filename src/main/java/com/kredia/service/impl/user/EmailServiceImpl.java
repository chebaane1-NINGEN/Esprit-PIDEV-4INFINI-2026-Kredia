package com.kredia.service.impl.user;

import com.kredia.service.user.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Override
    public void sendSecurityAlert(String email, String reason) {
        log.info("📧 [SECURITY ALERT] Sending email to {}: Reason - {}", email, reason);
        // In a real app, use JavaMailSender to send a real email
    }

    @Override
    public void sendWelcomeEmail(String email, String name) {
        log.info("📧 [WELCOME] Sending welcome email to {}: Welcome, {}!", email, name);
    }

    @Override
    public void sendPasswordResetEmail(String email, String token) {
        log.info("📧 [PASSWORD RESET] Sending reset link to {}: Token - {}", email, token);
    }
}
