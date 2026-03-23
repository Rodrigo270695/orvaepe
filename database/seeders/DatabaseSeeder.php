<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $this->call(CatalogCategorySeeder::class);
        $this->call(CatalogProductSeeder::class);
        $this->call(CatalogSkuSeeder::class);
        $this->call(OemLicenseCatalogSeeder::class);
        $this->call(MarketingServicesCatalogSeeder::class);

        $this->call(CouponSeeder::class);
        $this->call(SoftwareReleaseSeeder::class);

        $user = User::factory()->create([
            'username' => 'superadmin',
            'name' => 'Super',
            'lastname' => 'Admin',
            'email' => 'admin@orvae.local',
        ]);
        $user->assignRole('superadmin');
    }
}
