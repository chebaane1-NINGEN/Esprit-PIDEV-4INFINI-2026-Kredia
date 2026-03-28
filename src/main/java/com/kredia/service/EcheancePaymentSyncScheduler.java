package com.kredia.service;

import com.kredia.entity.credit.Echeance;
import com.kredia.repository.EcheanceRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class EcheancePaymentSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(EcheancePaymentSyncScheduler.class);

    private final EcheanceRepository echeanceRepository;
    private final EcheanceService echeanceService;

    // S'exécute toutes les 5 secondes pour une détection quasi "temps réel"
    @Scheduled(fixedDelay = 5000)
    public void syncEcheancesWithTransactions() {
        // Find echeances that have transactions but might not have their status synchronized yet
        List<Echeance> pendingEcheances = echeanceRepository.findPendingEcheancesWithTransaction();
        
        if (!pendingEcheances.isEmpty()) {
            log.info("Found {} echeances with transactions to sync.", pendingEcheances.size());
            for (Echeance echeance : pendingEcheances) {
                // This updates the echeance to PAID or PARTIALLY_PAID if transaction amount is sufficient
                echeanceService.checkAndUpdateStatus(echeance);
            }
        }
    }
}
