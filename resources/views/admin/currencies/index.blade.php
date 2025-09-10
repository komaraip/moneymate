@extends('layouts.admin')

@section('title', 'Currencies - Admin Panel')
@section('page-title', 'Currency Management')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-bold text-gray-900">Currencies</h2>
            <p class="text-gray-600">Manage system currencies</p>
        </div>
        <a href="{{ route('admin.currencies.create') }}" class="bg-[#efa13c] hover:bg-[#d68a2e] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
            <i class="fas fa-plus mr-2"></i>Add Currency
        </a>
    </div>

    <!-- Currencies Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @forelse($currencies as $currency)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{{ $currency->code }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">{{ $currency->name }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">{{ $currency->symbol }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                @if($currency->is_active)
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Active
                                    </span>
                                @else
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                        Inactive
                                    </span>
                                @endif
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">{{ $currency->users_count ?? 0 }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <a href="{{ route('admin.currencies.show', $currency) }}" class="text-blue-600 hover:text-blue-900">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="{{ route('admin.currencies.edit', $currency) }}" class="text-[#efa13c] hover:text-[#d68a2e]">
                                    <i class="fas fa-edit"></i>
                                </a>
                                @if(($currency->users_count ?? 0) == 0)
                                    <form action="{{ route('admin.currencies.destroy', $currency) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this currency?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-600 hover:text-red-900">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                @else
                                    <span class="text-gray-400" title="Cannot delete currency with users">
                                        <i class="fas fa-trash"></i>
                                    </span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                                No currencies found. <a href="{{ route('admin.currencies.create') }}" class="text-[#efa13c] hover:text-[#d68a2e]">Create one now</a>.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if($currencies->hasPages())
            <div class="px-6 py-4 border-t border-gray-200">
                {{ $currencies->links() }}
            </div>
        @endif
    </div>
</div>
@endsection
