<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CardTypeCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CardTypeCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CardTypeCategory::withCount('users');

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $cardTypes = $query->orderBy('name')->paginate(15);

        return view('admin.card-types.index', compact('cardTypes'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.card-types.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:card_type_categories,name',
            'description' => 'nullable|string|max:500',
            'logo_url' => 'nullable|url|max:255',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        CardTypeCategory::create([
            'name' => $request->name,
            'description' => $request->description,
            'logo_url' => $request->logo_url,
            'color' => $request->color ?: '#6B7280',
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.card-types.index')
                         ->with('success', 'Card type created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(CardTypeCategory $cardType)
    {
        $cardType->loadCount('users');
        return view('admin.card-types.show', compact('cardType'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CardTypeCategory $cardType)
    {
        return view('admin.card-types.edit', compact('cardType'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CardTypeCategory $cardType)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:card_type_categories,name,' . $cardType->id,
            'description' => 'nullable|string|max:500',
            'logo_url' => 'nullable|url|max:255',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $cardType->update([
            'name' => $request->name,
            'description' => $request->description,
            'logo_url' => $request->logo_url,
            'color' => $request->color ?: '#6B7280',
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('admin.card-types.index')
                         ->with('success', 'Card type updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CardTypeCategory $cardType)
    {
        // Check if any users are using this card type
        if ($cardType->users()->count() > 0) {
            return back()->with('error', 'Cannot delete card type that is being used by users.');
        }

        $cardType->delete();

        return redirect()->route('admin.card-types.index')
                         ->with('success', 'Card type deleted successfully!');
    }
}
