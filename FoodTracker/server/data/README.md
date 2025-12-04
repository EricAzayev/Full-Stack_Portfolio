# Food Tracker Data Module Documentation

## user.js
**Purpose**: Stores user profile and nutritional goals
- Contains user information: name, age, gender, height, weight, activity level, and calorie goal
- Referenced by `nutrientCalculator.js` to generate personalized nutrient recommendations
- **CRUD Operations**:
  - **Create/Update**: POST `/api/user` - User can update profile in the User Settings tab
  - **Read**: GET `/api/user` - Loaded when application starts

## nutrientCalculator.js
**Purpose**: Generates personalized micronutrient targets based on user profile
- References `user.js` data to calculate recommended daily intake for vitamins and minerals
- Uses age, gender, and activity level to determine appropriate nutrient goals
- **Read**: Imported and executed by routes to create `needToday` recommendations

## foodLibrary.js
**Purpose**: Master database of all available foods and their complete nutritional information
- Each food entry contains:
  - **Metadata**: Category, serving size, calories, probiotic status
  - **Nutrients**: Complete macronutrient and micronutrient profile (14 nutrients tracked)
  - **Supports**: Which body systems the food benefits (Brain, Muscle, Skin)
  - **Synergy**: Nutrient interactions (e.g., Vitamin D enhances Calcium absorption)
- **CRUD Operations**:
  - **Create**: POST `/api/foodLibrary` - Add new food via Food Library tab
  - **Read**: GET `/api/foodLibrary` - Displayed in Food Library tab and used for food selection
  - **Update**: PUT `/api/foodLibrary/:foodName` - Edit existing food entries
  - **Delete**: DELETE `/api/foodLibrary/:foodName` - Remove food from library

## today.js
**Purpose**: Tracks current day's nutritional intake in real-time
- Contains:
  - **nutrients**: Running totals of all 14 tracked nutrients for the day
  - **calories**: Total calorie intake for the day
  - **food**: Object mapping food names to servings consumed
  - **needToday**: Personalized daily nutrient targets (generated from user profile)
- **Updates**: Modified via PUT `/api/today` when user adds/removes food servings
- **Reset**: Automatically saved to `record.js` and reset at midnight (on first GET `/api/today` request of new day)
- **Visualization**: Powers all charts and progress bars in the Today tab

## record.js
**Purpose**: Historical archive of daily nutritional intake
- Stores an array of daily records, each containing:
  - **date**: Date in YYYY-MM-DD format
  - **nutrients**: Complete nutrient totals for that day
  - **calories**: Total calories consumed that day
  - **food**: All foods and servings consumed that day
  - **timestamp**: ISO timestamp of when the record was saved
- **Automatic Archival**: Current day's data from `today.js` is saved here during daily reset
- **Use Cases**:
  - Track nutrition consistency over time
  - Analyze eating patterns and habits
  - Review historical nutrient intake for specific dates
  - Future analytics and goal tracking features
- **CRUD Operations**:
  - **Create**: Automatically created during daily reset
  - **Read**: GET `/api/records` - Used for History and Analytics tabs

## lastReset.js
**Purpose**: Tracks when the last daily reset occurred
- Contains single field: `lastResetDate` (date string in "Day Mon DD YYYY" format)
- **Function**: Prevents multiple resets on the same day
- **Updated**: When automatic reset occurs (midnight) or manual reset is triggered
- **Check**: Compared against current date to determine if reset is needed 