package com.kredia.service;

import com.kredia.entity.credit.Echeance;
import com.kredia.enums.EcheanceStatus;
import com.kredia.repository.EcheanceRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EcheanceOverdueScheduler {

    private static final Logger log = LoggerFactory.getLogger(EcheanceOverdueScheduler.class);

    private final EcheanceRepository echeanceRepository;

    // Exécution tous les jours à minuit pile (00:00:00)
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void markOverdueEcheances() {
        LocalDate today = LocalDate.now();

        List<Echeance> late = echeanceRepository.findByStatusInAndDueDateBefore(
                List.of(EcheanceStatus.PENDING, EcheanceStatus.PARTIALLY_PAID),
                today
        );

        if (late.isEmpty()) return;

        // Taux de pénalité de 5%
        java.math.BigDecimal penaltyRate = new java.math.BigDecimal("0.05");

        late.forEach(e -> {
            e.setStatus(EcheanceStatus.OVERDUE);
            // Ajout de 5% de pénalité sur le montant dû
            java.math.BigDecimal penalty = e.getAmountDue().multiply(penaltyRate);
            e.setAmountDue(e.getAmountDue().add(penalty).setScale(2, java.math.RoundingMode.HALF_EVEN));
        });
        echeanceRepository.saveAll(late);
        log.info("{} échéance(s) passées en OVERDUE", late.size());
    }
}
