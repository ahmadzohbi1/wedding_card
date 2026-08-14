<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuestMember extends Model
{
    protected $fillable = [
        'guest_id',
        'table_id',
        'name',
        'is_primary',
        'rsvp_status',
        'responded_at',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'responded_at' => 'datetime',
    ];

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }
}
