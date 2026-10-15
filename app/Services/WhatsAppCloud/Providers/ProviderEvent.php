<?php

declare(strict_types=1);

namespace App\Services\WhatsAppCloud\Providers;

/**
 * Evento de webhook normalizado, independiente del proveedor.
 */
final readonly class ProviderEvent
{
    public const STATUS = 'status';

    public const MESSAGE = 'message';

    public const TEMPLATE_STATUS = 'template_status';

    private function __construct(
        public string $type,
        /** wamid del mensaje o id de la plantilla en Meta */
        public string $id,
        public ?string $phoneNumberId = null,
        public ?string $wabaId = null,
        /** sent|delivered|read|failed, o el evento de Meta para plantillas (APPROVED, REJECTED…) */
        public ?string $status = null,
        public ?int $timestamp = null,
        public ?string $errorCode = null,
        public ?string $errorMsg = null,
        public ?string $from = null,
        public ?string $messageType = null,
        public ?string $text = null,
        public ?string $contextId = null,
        public ?string $templateName = null,
        public ?string $templateLanguage = null,
    ) {}

    public static function status(
        string $phoneNumberId,
        string $wamid,
        string $status,
        ?int $timestamp,
        ?string $errorCode = null,
        ?string $errorMsg = null,
    ): self {
        return new self(
            type: self::STATUS,
            id: $wamid,
            phoneNumberId: $phoneNumberId,
            status: $status,
            timestamp: $timestamp,
            errorCode: $errorCode,
            errorMsg: $errorMsg,
        );
    }

    public static function message(
        string $phoneNumberId,
        string $wamid,
        string $from,
        string $messageType,
        ?string $text,
        ?string $contextId,
        ?int $timestamp,
    ): self {
        return new self(
            type: self::MESSAGE,
            id: $wamid,
            phoneNumberId: $phoneNumberId,
            timestamp: $timestamp,
            from: $from,
            messageType: $messageType,
            text: $text,
            contextId: $contextId,
        );
    }

    public static function templateStatus(
        string $wabaId,
        string $templateId,
        string $event,
        ?string $templateName,
        ?string $templateLanguage,
        ?string $reason,
    ): self {
        return new self(
            type: self::TEMPLATE_STATUS,
            id: $templateId,
            wabaId: $wabaId,
            status: $event,
            errorMsg: $reason,
            templateName: $templateName,
            templateLanguage: $templateLanguage,
        );
    }
}
