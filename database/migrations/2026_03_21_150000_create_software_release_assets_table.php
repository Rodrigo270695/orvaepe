<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('software_release_assets', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('software_release_id');

            $table->string('label', 255);
            $table->string('path', 512);
            $table->string('sha256', 64)->nullable();

            $table->timestamps();

            $table->foreign('software_release_id')
                ->references('id')
                ->on('software_releases')
                ->cascadeOnDelete();

            $table->index('software_release_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('software_release_assets');
    }
};
