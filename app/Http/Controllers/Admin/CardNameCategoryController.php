<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CardNameCategory;
use App\Models\CountryCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CardNameCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CardNameCategory::withCount('users');

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

        // Filter by country
        if ($request->filled('country')) {
            $query->where('country_code', $request->country);
        }

        $cardNames = $query->orderBy('name')->paginate(15);
        $countries = CountryCategory::active()->orderBy('name')->get();

        return view('admin.card-names.index', compact('cardNames', 'countries'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $countries = CountryCategory::active()->orderBy('name')->get();
        return view('admin.card-names.create', compact('countries'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:card_name_categories,name',
            'description' => 'nullable|string|max:500',
            'country_code' => 'required|string|max:3',
            'logo_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        CardNameCategory::create([
            'name' => $request->name,
            'description' => $request->description,
            'country_code' => $request->country_code,
            'logo_url' => $request->logo_url,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.card-names.index')
                         ->with('success', 'Card name category created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(CardNameCategory $cardName)
    {
        $cardName->loadCount('users');
        return view('admin.card-names.show', compact('cardName'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CardNameCategory $cardName)
    {
        $countries = CountryCategory::active()->orderBy('name')->get();
        return view('admin.card-names.edit', compact('cardName', 'countries'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CardNameCategory $cardName)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:card_name_categories,name,' . $cardName->id,
            'description' => 'nullable|string|max:500',
            'country_code' => 'required|string|max:3',
            'logo_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $cardName->update([
            'name' => $request->name,
            'description' => $request->description,
            'country_code' => $request->country_code,
            'logo_url' => $request->logo_url,
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('admin.card-names.index')
                         ->with('success', 'Card name category updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CardNameCategory $cardName)
    {
        // Check if any users are using this card name
        if ($cardName->users()->count() > 0) {
            return back()->with('error', 'Cannot delete card name that is being used by users.');
        }

        $cardName->delete();

        return redirect()->route('admin.card-names.index')
                         ->with('success', 'Card name category deleted successfully!');
    }
}
