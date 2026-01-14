<?php

namespace App\Http\Controllers;

use App\Services\InterviewQueryService;

class DashboardController extends Controller
{
    public function index(InterviewQueryService $service)
    {
        return view('dashboard.index', [
            'interviews' => $service->listForDashboard('submitted'),
            'stats' => $service->countByStatus(),
        ]);
    }
}
