<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CountryCategory;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CountryCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CountryCategory::withCount('users');

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%')
                  ->orWhere('code_2', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $countries = $query->orderBy('name')->paginate(15);

        return view('admin.countries.index', compact('countries'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $currencies = Currency::active()->orderBy('name')->get();
        return view('admin.countries.create', compact('currencies'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:country_categories,name',
            'code' => 'required|string|max:3|unique:country_categories,code',
            'code_2' => 'required|string|max:2|unique:country_categories,code_2',
            'currency_code' => 'nullable|string|max:3',
            'flag_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        CountryCategory::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'code_2' => strtoupper($request->code_2),
            'currency_code' => $request->currency_code,
            'flag_url' => $request->flag_url,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.countries.index')
                         ->with('success', 'Country created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(CountryCategory $country)
    {
        $country->loadCount('users');
        $country->load('currency');
        return view('admin.countries.show', compact('country'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CountryCategory $country)
    {
        $currencies = Currency::active()->orderBy('name')->get();
        return view('admin.countries.edit', compact('country', 'currencies'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CountryCategory $country)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:country_categories,name,' . $country->id,
            'code' => 'required|string|max:3|unique:country_categories,code,' . $country->id,
            'code_2' => 'required|string|max:2|unique:country_categories,code_2,' . $country->id,
            'currency_code' => 'nullable|string|max:3',
            'flag_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $country->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'code_2' => strtoupper($request->code_2),
            'currency_code' => $request->currency_code,
            'flag_url' => $request->flag_url,
            'is_active' => $request->boolean('is_active'),
        ]);

        return redirect()->route('admin.countries.index')
                         ->with('success', 'Country updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CountryCategory $country)
    {
        // Check if any users are from this country
        if ($country->users()->count() > 0) {
            return back()->with('error', 'Cannot delete country that has users.');
        }

        $country->delete();

        return redirect()->route('admin.countries.index')
                         ->with('success', 'Country deleted successfully!');
    }
}
