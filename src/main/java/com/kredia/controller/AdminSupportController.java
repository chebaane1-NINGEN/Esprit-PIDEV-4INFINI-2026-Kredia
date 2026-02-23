package com.kredia.controller;

import com.kredia.entity.support.Reclamation;
import com.kredia.enums.ReclamationStatus;
import com.kredia.service.SupportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/support")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSupportController {

    private final SupportService supportService;

    public AdminSupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    @GetMapping("/reclamations")
    public ResponseEntity<List<Reclamation>> getAllReclamations() {
        return ResponseEntity.ok(supportService.getAllReclamations());
    }

    @PutMapping("/reclamations/{id}/status")
    public ResponseEntity<Reclamation> updateStatus(
            @PathVariable Long id, 
            @RequestParam ReclamationStatus status,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(supportService.updateStatus(id, status, note));
    }
}
