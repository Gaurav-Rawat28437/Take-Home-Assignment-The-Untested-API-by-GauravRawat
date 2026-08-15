# Bug Report

## Bug #1 — Pagination Returns Incorrect Results for Page 1 and Page 2

Bug ID: BUG-001
Title: GET /tasks pagination returns incorrect results for page 1 and page 2
Severity: Medium
Priority: High
Status: Open
Affected functionality: Task pagination
Found by: API Integration Tests and Unit Tests


## Description

The task pagination logic uses an incorrect offset calculation.

The API uses 1-based pagination, where:

- Page 1 should contain Task 1–10
- Page 2 should contain Task 11–15

However, the current implementation calculates the pagination offset incorrectly.

As a result:

- page=1 returns Task 11–15 instead of Task 1–10.
- page=2 returns an empty array instead of Task 11–15.


## Steps to Reproduce

### 1. Create 15 tasks

Create the following tasks:

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


### 2. Test Page 1

Send the request:

GET /tasks?page=1&limit=10


### Expected Result

The API should return the first 10 tasks:

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


### Actual Result

The API returns:

Task 11
Task 12
Task 13
Task 14
Task 15

Actual response length:

5


### 3. Test Page 2

Send the request:

GET /tasks?page=2&limit=10


### Expected Result

The API should return:

Task 11
Task 12
Task 13
Task 14
Task 15

Expected response length:

5


### Actual Result

The API returns:

[]

Actual response length:

0


## Test Evidence

The pagination bug was detected by both the API integration tests and the service unit tests.

### API Test — Page 1

Expected length:

10

Received length:

5

Returned tasks:

Task 11
Task 12
Task 13
Task 14
Task 15


### API Test — Page 2

Expected length:

5

Received length:

0

Returned array:

[]


### Unit Test — Page 1

The service test:

taskService.getPaginated(1, 10)

expects:

10 tasks
Task 1 to Task 10

but receives:

5 tasks
Task 11 to Task 15


### Unit Test — Page 2

The service test:

taskService.getPaginated(2, 10)

expects:

5 tasks
Task 11 to Task 15

but receives:

0 tasks
[]


## Root Cause

The problem is in:

src/services/taskService.js

The current pagination logic is equivalent to:

const getPaginated = (page, limit) => {
    const offset = page * limit;
    return tasks.slice(offset, offset + limit);
};


The problem is the calculation:

page * limit

The API uses 1-based page numbers, while JavaScript arrays use zero-based indexes.

For example:

page = 1
limit = 10

The current calculation is:

offset = 1 * 10
       = 10

Then the service executes:

tasks.slice(10, 20)

Array index 10 represents the 11th task.

Therefore, page 1 incorrectly starts from Task 11.


## Page 2 Root Cause

For:

page = 2
limit = 10

The current calculation is:

offset = 2 * 10
       = 20

Then the service effectively executes:

tasks.slice(20, 30)

Only 15 tasks exist.

Therefore, the result is:

[]


## Expected Pagination Logic

For 1-based pagination, the offset should be:

const offset = (page - 1) * limit;


For page 1:

page = 1
limit = 10

offset = (1 - 1) * 10
       = 0

Then:

tasks.slice(0, 10)

returns:

Task 1 to Task 10


For page 2:

page = 2
limit = 10

offset = (2 - 1) * 10
       = 10

Then:

tasks.slice(10, 20)

returns:

Task 11 to Task 15.


## Suggested Fix

Change:

const offset = page * limit;

to:

const offset = (page - 1) * limit;


The corrected function should be:

const getPaginated = (page, limit) => {
    const offset = (page - 1) * limit;

    return tasks.slice(offset, offset + limit);
};


## Test Results Before Fix

Current test result:

Test Suites: 2 failed, 2 total
Tests:       4 failed, 29 passed, 33 total


### Failed Tests

1. Task API
   GET /tasks?page=1&limit=10 should return first page

2. Task API
   GET /tasks?page=2&limit=10 should return second page

3. Task Service
   it will return the first page of paginated tasks

4. Task Service
   it will return the second page of paginated tasks


### Passed Tests

29 tests passed.

The remaining API and service tests are passing.


## Impact

The bug affects users who use task pagination.

Because of this issue:

- The first page does not show the first 10 tasks.
- The first page incorrectly shows tasks from the second page.
- The second page shows no tasks.
- Users cannot correctly navigate through paginated tasks.


## Severity and Priority

Severity: Medium

The application and other task operations continue to work, but pagination produces incorrect results.

Priority: High

Pagination is a core API feature and should return the correct set of tasks for each requested page.


## Test Coverage

The bug is covered at two levels.

### API Integration Testing

Test file:

tests/taskAPI.test.js

Tests:

GET /tasks?page=1&limit=10
GET /tasks?page=2&limit=10


### Unit Testing

Test file:

tests/taskService.test.js

Tests:

taskService.getPaginated(1, 10)
taskService.getPaginated(2, 10)


Testing at both levels confirms that the issue originates in the pagination logic used by the service and is exposed through the API.


## Verification After Fix

After applying the fix, run:

npm test

The following API tests should pass:

GET /tasks?page=1&limit=10 should return first page

GET /tasks?page=2&limit=10 should return second page


The following service tests should also pass:

it will return the first page of paginated tasks

it will return the second page of paginated tasks


The complete test suite should pass after the fix.


## Bug Status

Bug ID: BUG-001

Issue: Incorrect pagination offset

API Test: FAILED

Unit Test: FAILED

Status: OPEN


## Testing Workflow

1. API Testing       DONE
2. Unit Testing      DONE
3. Bug Report        DONE
4. Fix Bug           PENDING
5. Run npm test      PENDING
6. Verify all pass   PENDING
7. Commit fix        PENDING
8. Push changes      PENDING


## Conclusion

The API and service tests successfully identified a real pagination defect in the existing implementation.

The root cause is the use of:

page * limit

instead of:

(page - 1) * limit

Because the API uses 1-based pagination and JavaScript arrays use zero-based indexes, the current calculation skips the first page and causes the second page to return an empty result.

No production code has been changed as part of identifying and documenting this bug.

The bug remains open until the pagination implementation is fixed and the complete test suite passes.