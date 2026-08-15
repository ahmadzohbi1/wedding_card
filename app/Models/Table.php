<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Table extends Model
{
    protected $fillable = [
        'name',
        'zone',
        'seats',
        'shape',
        'is_main',
    ];

    protected $casts = [
        'seats' => 'integer',
        'is_main' => 'boolean',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(GuestMember::class);
    }
}
