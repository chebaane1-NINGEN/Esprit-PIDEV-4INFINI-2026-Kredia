package com.kredia.util;

import com.kredia.entity.support.Notification;
import com.kredia.enums.NotificationType;

public class NotificationFactory {

    public static Notification forUser(Long userId, Long id, NotificationType type, String title, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setReclamationId(id);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setRead(false);
        return n;
    }
}
