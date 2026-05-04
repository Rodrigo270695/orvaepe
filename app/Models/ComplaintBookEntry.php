<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintBookEntry extends Model
{
    protected $fillable = [
        'full_name',
        'document_type',
        'document_number',
        'email',
        'phone',
        'address',
        'is_minor',
        'representative_full_name',
        'product_service_description',
        'claim_detail',
        'request_detail',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'is_minor' => 'boolean',
        ];
    }
}
