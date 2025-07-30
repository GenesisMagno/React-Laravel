<?php


namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Additional users as needed
        User::create([
            'name' => 'kengkoy',
            'email' => 'g@gmail.com',
            'password' => Hash::make('ulolmoka'),
            'role' => 'admin',
        ]);
        User::create([
            'name' => 'kengkoy',
            'email' => 'j@gmail.com',
            'password' => Hash::make('ulolmoka'),
        ]);
    }
}

