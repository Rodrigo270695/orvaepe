<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesHubMessage extends Model
{
    public const UPDATED_AT = null;

    public const IN = 'in';

    public const OUT = 'out';

    public const AUTOR_CLIENTE = 'cliente';

    public const AUTOR_BOT = 'bot';

    public const AUTOR_HUMANO = 'humano';

    protected $fillable = [
        'sales_hub_conversation_id',
        'direccion',
        'autor',
        'tipo',
        'body',
        'producto',
        'wa_message_id',
    ];

    /**
     * @return BelongsTo<SalesHubConversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(SalesHubConversation::class, 'sales_hub_conversation_id');
    }
}
