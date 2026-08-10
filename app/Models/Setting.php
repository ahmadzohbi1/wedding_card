<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get(string $key, ?string $default = null): ?string
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    public static function set(string $key, string $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function flag(string $key, bool $default = true): bool
    {
        $value = static::get($key);

        return $value === null ? $default : $value === '1';
    }

    public static function setFlag(string $key, bool $value): void
    {
        static::set($key, $value ? '1' : '0');
    }
}
