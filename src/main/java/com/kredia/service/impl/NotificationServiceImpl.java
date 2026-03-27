package com.kredia.service.impl;

import com.kredia.dto.notification.NotificationCreateRequest;
import com.kredia.dto.notification.NotificationResponse;
import com.kredia.entity.support.Notification;
import com.kredia.exception.ResourceNotFoundException;
import com.kredia.repository.NotificationRepository;
import com.kredia.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public NotificationResponse create(NotificationCreateRequest request) {
        Notification n = new Notification();
        n.setUserId(request.userId());
        n.setReclamationId(request.reclamationId());
        n.setType(request.type());
        n.setTitle(request.title());
        n.setMessage(request.message());
        n.setRead(false);

        return toResponse(notificationRepository.save(n));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getByUser(Long userId, Boolean isRead, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sentAt").descending());

        if (isRead == null) {
            return notificationRepository.findByUserId(userId, pageable).map(this::toResponse);
        }
        return notificationRepository.findByUserIdAndIsRead(userId, isRead, pageable).map(this::toResponse);
    }

    @Override
    public NotificationResponse markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));

        n.setRead(true);
        return toResponse(notificationRepository.save(n));
    }

    @Override
    public void delete(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found: " + id);
        }
        notificationRepository.deleteById(id);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getUserId(),
                n.getReclamationId(),
                n.getType(),
                n.getTitle(),
                n.getMessage(),
                n.isRead(),
                n.getSentAt());
    }
}
