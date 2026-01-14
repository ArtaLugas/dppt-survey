<?php

namespace App\Http\Controllers;

use App\Models\Interview;
use App\Services\InterviewService;
use App\Http\Requests\{
    InterviewStoreRequest,
    InterviewUpdateRequest,
    InterviewSubmitRequest,
    InterviewVerifyRequest,
    InterviewLockRequest
};
use App\Models\InterviewStatus;

class InterviewController extends Controller
{
    public function store(InterviewStoreRequest $request)
    {
        $this->authorize('create', Interview::class);

        $draftStatusId = InterviewStatus::where('code', 'draft')->first()->id;

        $interview = Interview::create(
            $request->validated() + [
                'status_id'  => $draftStatusId,
                'created_by'=> $request->user()->id,
            ]
        );

        return response()->json($interview, 201);
    }

    public function update(
        InterviewUpdateRequest $request,
        Interview $interview
    ) {
        $this->authorize('update', $interview);

        $interview->update($request->validated());

        return response()->json($interview);
    }

    public function submit(
        InterviewSubmitRequest $request,
        Interview $interview,
        InterviewService $service
    ) {
        $service->submit($interview, $request->user());

        return response()->json(['message' => 'Interview submitted']);
    }

    public function verify(
        InterviewVerifyRequest $request,
        Interview $interview,
        InterviewService $service
    ) {
        $service->verify($interview, $request->user());

        return response()->json(['message' => 'Interview verified']);
    }

    public function lock(
        InterviewLockRequest $request,
        Interview $interview,
        InterviewService $service
    ) {
        $service->lock($interview, $request->user());

        return response()->json(['message' => 'Interview locked']);
    }
}
