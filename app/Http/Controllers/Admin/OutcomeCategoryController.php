<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OutcomeCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OutcomeCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = OutcomeCategory::withCount('transactions');

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

        $outcomeCategories = $query->orderBy('name')->paginate(15);

        return view('admin.outcome-categories.index', compact('outcomeCategories'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.outcome-categories.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:outcome_categories,name',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        OutcomeCategory::create([
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'color' => $request->color,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.outcome-categories.index')
                         ->with('success', 'Outcome category created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(OutcomeCategory $outcomeCategory)
    {
        $outcomeCategory->loadCount('transactions');
        return view('admin.outcome-categories.show', compact('outcomeCategory'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OutcomeCategory $outcomeCategory)
    {
        return view('admin.outcome-categories.edit', compact('outcomeCategory'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, OutcomeCategory $outcomeCategory)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:outcome_categories,name,' . $outcomeCategory->id,
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $outcomeCategory->update([
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'color' => $request->color,
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('admin.outcome-categories.index')
                         ->with('success', 'Outcome category updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OutcomeCategory $outcomeCategory)
    {
        // Check if any transactions are using this category
        if ($outcomeCategory->transactions()->count() > 0) {
            return back()->with('error', 'Cannot delete category that is being used by transactions.');
        }

        $outcomeCategory->delete();

        return redirect()->route('admin.outcome-categories.index')
                         ->with('success', 'Outcome category deleted successfully!');
    }
}
