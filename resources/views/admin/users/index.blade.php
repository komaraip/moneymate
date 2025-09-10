@extends('layouts.admin')

@section('title', 'User Management - MoneyMate Admin')
@section('page-title', 'User Management')

@section('content')
<div class="bg-white rounded-lg shadow-sm">
    <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
                <h2 class="text-lg sm:text-xl font-semibold text-gray-900">All Users</h2>
                <p class="text-xs sm:text-sm text-gray-600 mt-1">Manage registered users and their accounts</p>
            </div>
            <div class="text-xs sm:text-sm text-gray-500">
                Total: {{ $users->total() }} users
            </div>
        </div>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                @forelse($users as $user)
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            @if($user->profile)
                                <img src="{{ asset('storage/' . $user->profile) }}" alt="{{ $user->name }}" class="h-8 w-8 rounded-full object-cover">
                            @else
                                <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#efa13c] flex items-center justify-center text-white font-medium text-sm sm:text-base">
                                    {{ substr($user->name, 0, 1) }}
                                </div>
                            @endif
                            <div class="ml-3 sm:ml-4 min-w-0 flex-1">
                                <div class="text-xs sm:text-sm font-medium text-gray-900 truncate">{{ $user->name }}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-xs sm:text-sm text-gray-900 truncate max-w-xs">{{ $user->email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-xs sm:text-sm text-gray-900">{{ $user->created_at->format('M d, Y') }}</div>
                        <div class="text-xs text-gray-500">{{ $user->created_at->diffForHumans() }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-xs sm:text-sm text-gray-900">{{ $user->transactions_count }}</div>
                        <div class="text-xs text-gray-500">total transactions</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            <a href="{{ route('admin.users.show', $user) }}"
                               class="text-blue-600 hover:text-blue-900 flex items-center justify-center sm:justify-start text-xs sm:text-sm">
                                <i class="fas fa-eye mr-1"></i>
                                View
                            </a>
                            <a href="{{ route('admin.users.transactions', $user) }}"
                               class="text-green-600 hover:text-green-900 flex items-center justify-center sm:justify-start text-xs sm:text-sm">
                                <i class="fas fa-list mr-1"></i>
                                <span class="hidden sm:inline">Transactions</span>
                                <span class="sm:hidden">Trans.</span>
                            </a>
                            <form method="POST" action="{{ route('admin.users.destroy', $user) }}"
                                  class="inline w-full sm:w-auto"
                                  onsubmit="return confirm('Are you sure you want to delete this user? This action cannot be undone.')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-900 flex items-center justify-center sm:justify-start text-xs sm:text-sm w-full sm:w-auto">
                                    <i class="fas fa-trash mr-1"></i>
                                    Delete
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="px-4 sm:px-6 py-8 sm:py-12 text-center">
                        <div class="text-gray-500">
                            <i class="fas fa-users text-3xl sm:text-4xl mb-3 sm:mb-4 text-gray-300"></i>
                            <p class="text-base sm:text-lg font-medium">No users found</p>
                            <p class="text-xs sm:text-sm">Users will appear here once they register.</p>
                        </div>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if($users->hasPages())
    <div class="px-4 sm:px-6 py-4 border-t border-gray-200">
        {{ $users->links() }}
    </div>
    @endif
</div>
@endsection
