# Postman Collections for Consensus API

This folder contains Postman collections for testing the Consensus API.

## 📁 Collections

### 1. [Consensus-Phase1-API.postman_collection.json](./Consensus-Phase1-API.postman_collection.json)
**Complete API collection for Phase 1 (MVP) endpoints**

This collection contains all the API endpoints planned for Phase 1 of the Consensus application:

- **Health Check** - API status verification
- **Clubs** - CRUD operations for clubs
- **Members** - Member management within clubs
- **Rounds** - Round management and status updates
- **Recommendations** - Recommendation submission and management
- **Voting** - Vote submission and voting closure
- **Completions** - Completion tracking and round finishing
- **Notifications** - Notification management and read status tracking

**Usage**: Import this collection to explore and test all available API endpoints.

### 2. [Consensus-Happy-Path-Test.postman_collection.json](./Consensus-Happy-Path-Test.postman_collection.json)
**Complete happy path test scenario**

This collection implements the complete happy path workflow with 3 people and 3 recommendations:

1. **Setup** - Health check
2. **Create Club** - Book club with 3-3-3 configuration
3. **Add Members** - Alice, Bob, and Charlie
4. **Start Round** - Alice's turn to recommend
5. **Recommendations** - Alice recommends 3 books
6. **Start Voting** - Change round status to voting
7. **Everyone Votes** - All 3 members vote with different preferences
8. **Close Voting** - Determine winner (handles ties)
9. **Mark Completions** - All members mark as complete
10. **Finish Round** - Complete round and start next (Bob's turn)
11. **Cleanup** - Delete test club

**Voting Scenario**:
- Alice votes: [3, 2, 1] (Great Gatsby, 1984, Mockingbird)
- Bob votes: [1, 3, 2] (1984, Great Gatsby, Mockingbird)
- Charlie votes: [2, 1, 3] (Mockingbird, Great Gatsby, 1984)
- **Result**: All books tie with 6 points each, winner determined by tie-breaking method

**Usage**: Run this collection to test the complete workflow end-to-end.

### 3. [Consensus-Notifications-API.postman_collection.json](./Consensus-Notifications-API.postman_collection.json)
**Dedicated notification system testing collection**

This collection focuses specifically on testing the notification system endpoints:

- **Get All Notifications** - Retrieve paginated notification history
- **Get Unread Notifications** - Fetch only unread notifications
- **Get Unread Count** - Get the count of unread notifications
- **Mark as Read** - Mark individual notifications as read
- **Mark All as Read** - Mark all notifications as read for a user

**Usage**: Use this collection to test notification functionality independently or after running the happy path test to verify notifications were created.

## 🚀 Getting Started

### 1. Import Collections

1. Open Postman
2. Click "Import" button
3. Select the collection files from this folder
4. Collections will be imported with all requests and tests

### 2. Set Up Environment Variables

The collections use the following variables:

- `base_url`: API base URL (default: `http://localhost:3001`)
- `club_id`: Club ID (auto-populated during tests)
- `member_a_id`, `member_b_id`, `member_c_id`: Member IDs (auto-populated)
- `round_id`: Round ID (auto-populated)
- `rec_1_id`, `rec_2_id`, `rec_3_id`: Recommendation IDs (auto-populated)
- `winner_id`: Winner recommendation ID (auto-populated)
- `notification_id`: Notification ID for testing read status

### 3. Run Tests

#### For Individual Endpoint Testing:
1. Use the **Consensus-Phase1-API** collection
2. Set the `base_url` variable to your API URL
3. Run individual requests to test specific endpoints

#### For Complete Workflow Testing:
1. Use the **Consensus-Happy-Path-Test** collection
2. Set the `base_url` variable to your API URL
3. Run the entire collection to test the complete workflow
4. All variables will be automatically populated during the test run

### 4. View Test Results

Each request in the collections includes automated tests that verify:
- Response status codes
- Response data structure
- Expected values
- Variable population

Check the "Test Results" tab in Postman to see which tests pass or fail.

## 🧪 Test Scenarios

### Happy Path Test Details

The happy path test simulates a real book club scenario:

**Club Configuration**:
- Type: Book club
- Min/Max recommendations: 3
- Voting points: [3, 2, 1]
- Turn order: Sequential
- Tie-breaking: Random
- Minimum participation: 100%

**Workflow**:
1. Alice recommends 3 books
2. All members vote with different preferences
3. Voting results in a tie (all books get 6 points)
4. Winner determined by random tie-breaking
5. All members complete the chosen book
6. Round finishes and next round starts with Bob as recommender

**Expected Results**:
- All API calls return appropriate status codes
- Data is properly stored and retrieved
- Voting calculations are correct
- Turn rotation works properly
- Tie-breaking is handled correctly

## 🔧 Customization

### Adding New Tests

To add new test scenarios:

1. **Copy the happy path collection**
2. **Modify the test data** (club config, member names, recommendations, votes)
3. **Update the test assertions** to match your expected results
4. **Save with a descriptive name**

### Modifying API Endpoints

If API endpoints change:

1. **Update the request URLs** in the collections
2. **Modify request bodies** to match new API requirements
3. **Update test assertions** to match new response formats
4. **Update the API documentation** in `../API-ENDPOINTS.md`

## 📊 Test Coverage

The collections provide comprehensive test coverage for:

- ✅ **CRUD Operations** - Create, read, update, delete for all entities
- ✅ **Workflow States** - All round status transitions
- ✅ **Voting Logic** - Point allocation and winner determination
- ✅ **Tie-Breaking** - Random selection when votes are tied
- ✅ **Turn Management** - Sequential turn rotation
- ✅ **Completion Tracking** - Member completion status
- ✅ **Notification System** - Real-time notifications and read status tracking
- ✅ **Data Validation** - Request/response format validation
- ✅ **Error Handling** - Status code verification

## 🐛 Troubleshooting

### Common Issues

**1. Connection Refused**:
- Ensure the API server is running on the correct port
- Check the `base_url` variable is set correctly

**2. Test Failures**:
- Check the API server logs for errors
- Verify database connection if using database
- Ensure all required environment variables are set

**3. Variable Not Set**:
- Run the collections in order (happy path test auto-populates variables)
- Manually set variables if running individual requests

### Debug Mode

To debug test failures:

1. **Check the "Console" tab** in Postman for detailed logs
2. **Review the "Test Results" tab** for specific test failures
3. **Check the response body** to see actual API responses
4. **Verify the request payload** matches API expectations

## 📝 Notes

- The happy path test includes cleanup to remove test data
- All tests are designed to be idempotent (can be run multiple times)
- Variables are automatically managed during test execution
- Tests include both positive and negative scenarios where applicable

## 🤝 Contributing

When adding new tests or modifying existing ones:

1. **Follow the naming convention** used in existing tests
2. **Include comprehensive test assertions** for all important fields
3. **Add comments** explaining complex test logic
4. **Update this README** if adding new test scenarios
5. **Test your changes** before committing
