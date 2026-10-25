package com.smartcampus.smartcampus.service;

import com.smartcampus.smartcampus.entity.AuditLog;
import com.smartcampus.smartcampus.repository.AuditLogRepository;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * SC-94 — Service d'enregistrement des événements de sécurité (journal d'audit).
 * Les appels sont asynchrones pour ne pas impacter les performances.
 */
@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    public void log(String eventType, String email, String details, String outcome) {
        try {
            AuditLog entry = new AuditLog();
            entry.setEventType(eventType);
            entry.setEmail(email);
            entry.setDetails(details);
            entry.setOutcome(outcome);
            entry.setIpAddress(resolveClientIp());

            auditLogRepository.save(entry);

            log.info("[AUDIT] {} | {} | {} | {}", eventType, email, outcome, details);

        } catch (Exception e) {
            // Ne pas faire planter l'app si l'audit échoue
            log.error("[AUDIT] Échec d'enregistrement : {}", e.getMessage());
        }
    }

    /** Récupère l'IP du client en tenant compte des proxies. */
    private String resolveClientIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return "unknown";

            HttpServletRequest request = attrs.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");

            if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();

        } catch (Exception e) {
            return "unknown";
        }
    }
}
