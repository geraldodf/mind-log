-- Social/follow notification fields and message type discriminator.
-- related_username / related_name: actor for follow events (NULL for media notifications).
-- notification_type: FOLLOW | MEDIA_RELEASE_TODAY | MEDIA_RELEASE_SOON (NULL for legacy rows).
ALTER TABLE notifications
    ADD COLUMN related_username   VARCHAR(255),
    ADD COLUMN related_name       VARCHAR(255),
    ADD COLUMN notification_type  VARCHAR(50);
