<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(
        Request $request
    ): JsonResponse {

        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255'
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email,' . $user->id
            ],
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => $user,
        ]);
    }


    public function changePassword(
        Request $request
    ): JsonResponse {

        $validated = $request->validate([
            'current_password' => [
                'required'
            ],

            'password' => [
                'required',
                'confirmed',
                Password::min(8)
            ],
        ]);

        $user = $request->user();

        if (
            !Hash::check(
                $validated['current_password'],
                $user->password
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        /*
         * Thu hồi các token khác.
         */
        $currentTokenId =
            $user->currentAccessToken()?->id;

        if ($currentTokenId) {
            $user->tokens()
                ->where('id', '!=', $currentTokenId)
                ->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }
}
