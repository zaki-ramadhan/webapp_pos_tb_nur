<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class ResourceUpdatedEvent implements ShouldBroadcastNow
{
    public function __construct(
        public string $resourceKey,
        public string $action = 'updated',
        public mixed $recordId = null
    ) {
    }

    public function broadcastOn(): array
    {
        return [new Channel('workspace-resources')];
    }

    public function broadcastAs(): string
    {
        return 'resource.updated';
    }
}
