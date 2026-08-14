<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guest extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'side',
        'gender',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function members(): HasMany
    {
        return $this->hasMany(GuestMember::class);
    }

    public function url(): string
    {
        return url('/'.$this->slug);
    }
}
