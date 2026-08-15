Bug Report

Bug #1 — Pagination returns incorrect results for page 1

Bug ID: BUG-001
Title: GET /tasks?page=1&limit=10 returns tasks 11–15 instead of tasks 1–10
Severity: Medium
Priority: High
Status: Open
Affected functionality: Task pagination
Found by: API Test and Unit Test

Description

The pagination logic uses an incorrect offset calculation.

When requesting:

GET /tasks?page=1&limit=10

the API is expected to return the first 10 tasks:

Task 1
Task 2
Task 3
...
Task 10

However, the API returns only tasks 11–15:

Task 11
Task 12
Task 13
Task 14
Task 15

Therefore, only 5 tasks are returned instead of 10.

Steps to Reproduce

1. Create 15 tasks

For example:

Task 1
Task 2
Task 3
Task 4
Task 5
Task 6
Task 7
Task 8
Task 9
Task 10
Task 11
Task 12
Task 13
Task 14
Task 15

2. Send the request

GET /tasks?page=1&limit=10

3. Expected Result

The API should return 10 tasks:

Task 1
Task 2
Task 3
Task 4
Task 5
Task 6
Task 7
Task 8
Task 9
Task 10

Expected response length:

10

4. Actual Result

The API returns:

Task 11
Task 12
Task 13
Task 14
Task 15

Actual response length:

5

Test Evidence

The API test failed with:

Expected length: 10
Received length: 5

The returned tasks were:

Task 11
Task 12
Task 13
Task 14
Task 15

The same problem was found by both:

tests/taskAPI.test.js
tests/taskService.test.js

Root Cause

The problem is in src/services/taskService.js:

const getPaginated = (page, limit) => {
  const offset = page * limit;
  return tasks.slice(offset, offset + limit);
};

For:

page = 1
limit = 10

the code calculates:

offset = 1 * 10
       = 10

Then it executes:

tasks.slice(10, 20)

JavaScript arrays use zero-based indexes. Therefore, index 10 represents the 11th task.

This causes page 1 to start from Task 11.

Expected Pagination Logic

For page 1, the offset should be 0.

The correct calculation is:

const offset = (page - 1) * limit;

For:

page = 1
limit = 10

the calculation becomes:

offset = (1 - 1) * 10
       = 0

Then:

tasks.slice(0, 10)

returns:

Task 1 → Task 10

Suggested Fix

Change:

const offset = page * limit;

to:

const offset = (page - 1) * limit;

The corrected function should be:

const getPaginated = (page, limit) => {
  const offset = (page - 1) * limit;
  return tasks.slice(offset, offset + limit);
};

Verification After Fix

Run:

npm test

The following tests should pass:

GET /tasks?page=1&limit=10

and:

Task Service › it will return paginated tasks

Test Summary Before Fix

Test Suites: 2 failed, 2 total
Tests:       2 failed, 29 passed, 31 total

Both failures are caused by the same pagination bug.

Bug ID

Issue

API Test

Unit Test

Status

BUG-001

Incorrect pagination offset

❌

❌

Open

Testing Workflow

1. API Testing       ✅
2. Unit Testing      ✅
3. Bug Report        ✅
4. Fix Bugs          ⏳
5. Run npm test      ⏳
6. Verify all pass   ⏳
7. Commit fixes      ⏳

Note: This bug report documents the bug found during testing. The bug should be fixed separately, followed by running the complete test suite again.