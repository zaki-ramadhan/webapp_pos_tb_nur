<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('access_groups', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('access_group_permissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('access_group_id')->constrained()->cascadeOnDelete();
            $table->string('menu_key');
            $table->boolean('can_access')->default(false);
            $table->boolean('can_create')->default(false);
            $table->boolean('can_update')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->boolean('can_view')->default(false);
            $table->timestamps();
        });

        Schema::create('access_group_user', function (Blueprint $table): void {
            $table->foreignId('access_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['access_group_id', 'user_id']);
        });

        Schema::create('role_user', function (Blueprint $table): void {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'user_id']);
        });

        Schema::create('numbering_sequences', function (Blueprint $table): void {
            $table->id();
            $table->string('transaction_type');
            $table->string('name');
            $table->string('sequence_type');
            $table->unsignedSmallInteger('counter_digits')->default(5);
            $table->unsignedBigInteger('current_counter')->default(0);
            $table->string('prefix')->nullable();
            $table->string('suffix')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('numbering_sequence_components', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('numbering_sequence_id')->constrained()->cascadeOnDelete();
            $table->string('component_key');
            $table->string('component_value')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('numbering_sequence_user', function (Blueprint $table): void {
            $table->foreignId('numbering_sequence_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['numbering_sequence_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('numbering_sequence_user');
        Schema::dropIfExists('numbering_sequence_components');
        Schema::dropIfExists('numbering_sequences');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('access_group_user');
        Schema::dropIfExists('access_group_permissions');
        Schema::dropIfExists('access_groups');
        Schema::dropIfExists('roles');
    }
};
