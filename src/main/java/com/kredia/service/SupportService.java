package com.kredia.service;

import com.kredia.entity.support.Reclamation;
import com.kredia.entity.support.ReclamationHistory;
import com.kredia.enums.ReclamationStatus;
import com.kredia.repository.ReclamationRepository;
import com.kredia.user.entity.User;
import com.kredia.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class SupportService {

    private final ReclamationRepository reclamationRepository;
    private final UserService userService;

    public SupportService(ReclamationRepository reclamationRepository, UserService userService) {
        this.reclamationRepository = reclamationRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Reclamation> getAllReclamations() {
        return reclamationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Reclamation getReclamationById(Long id) {
        Long requiredId = Objects.requireNonNull(id, "id");
        return reclamationRepository.findById(requiredId)
                .orElseThrow(() -> new RuntimeException("Reclamation not found: " + requiredId));
    }

    @Transactional
    public Reclamation updateStatus(Long id, ReclamationStatus newStatus, String note) {
        Reclamation rec = getReclamationById(id);
        ReclamationStatus oldStatus = rec.getStatus();
        rec.setStatus(newStatus);
        
        if (newStatus == ReclamationStatus.RESOLVED) {
            rec.setResolvedAt(LocalDateTime.now());
        }

        ReclamationHistory history = new ReclamationHistory();
        history.setReclamation(rec);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setNote(note);
        history.setChangedBy("ADMIN"); // Simplified for now
        
        if (rec.getHistory() == null) rec.setHistory(new ArrayList<>());
        rec.getHistory().add(history);

        return reclamationRepository.save(rec);
    }
    
    @Transactional
    public Reclamation createReclamation(Long userId, String subject, String description) {
        User user = userService.getUserById(Objects.requireNonNull(userId, "userId"));
        Reclamation rec = new Reclamation();
        rec.setUser(user);
        rec.setSubject(subject);
        rec.setDescription(description);
        rec.setStatus(ReclamationStatus.OPEN);
        return reclamationRepository.save(rec);
    }
}
