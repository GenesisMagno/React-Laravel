<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page'); // default is 2 per page
        $query = User::query();

        if ($request->has('q')) {
            $search = $request->get('q');

            // Example: search by name or email
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'per_page' => $users->perPage(),
            'total' => $users->total(),
            'from' => $users->firstItem(),
            'to' => $users->lastItem(),
            'has_more_pages' => $users->hasMorePages()
        ]);
    }

    public function show(User $user)
    {
         return response()->json(['user'=>$user]);
    }

    public function update(User $user, Request $request)
    {
    try {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'required|string|max:20',
            'street_address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'zip_code' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $originalName = pathinfo($request->file('image')->getClientOriginalName(), PATHINFO_FILENAME);
            $safeName = substr(preg_replace('/[^a-zA-Z0-9]/', '', $originalName), 0, 20);
            $newFilename = 'user_' . $user->id . '_' . $safeName . '_' . time() . '.' . 
                          $request->file('image')->getClientOriginalExtension();

            if ($user->image) {
                User::destroyImage($user->image); // Ensure this exists
            }

            $validated['image'] = $request->file('image')->storeAs(
                'userImages',
                $newFilename,
                'public'
            );
        } else {
            unset($validated['image']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);

    } catch (\Exception $e) {
        \Log::error('User update failed: ' . $e->getMessage());
        return response()->json([
            'message' => 'An error occurred while updating the user.',
            'error' => $e->getMessage()
        ], 500);
    }
}


    public function destroy(User $user)
    {
        //
    }
}
