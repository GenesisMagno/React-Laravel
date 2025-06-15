<?php
use App\Models\Product;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanOrphanedImages extends Command
{
    protected $signature = 'images:clean-orphaned';
    protected $description = 'Deletes orphaned images from productImages and userImages directories.';

    public function handle()
    {
        $this->cleanImages('productImages', Product::pluck('image')->filter()->toArray());
        $this->cleanImages('userImages', User::pluck('image')->filter()->toArray());

        $this->info('Cleanup complete.');
    }

    protected function cleanImages(string $folder, array $usedImages)
    {
        $allImages = Storage::disk('public')->files($folder);
        $deleted = 0;

        foreach ($allImages as $image) {
            if (!in_array($image, $usedImages)) {
                Storage::disk('public')->delete($image);
                $this->info("Deleted: $image");
                $deleted++;
            }
        }

        $this->info("[$folder] $deleted orphaned images deleted.");
    }

    public function schedule(\Illuminate\Console\Scheduling\Schedule $schedule): void
    {
        $schedule->hourly(); // Or hourly(), etc.
    }
}
