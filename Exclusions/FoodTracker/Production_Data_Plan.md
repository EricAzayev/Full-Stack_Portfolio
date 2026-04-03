# Production Data Plan

## Overview
The `server/data/` folder contains template files that outline how data should be structured and generated. In production, this approach ensures clean initialization while preventing user-generated data from polluting version control.

## Current Implementation
- Template files serve as examples of expected data structure
- Each file contains minimal starter data showing the schema
- Files function as documentation for developers and the application

## Recommended Production Strategy

### 1. Keep Templates in Git, Exclude Runtime Data
**Rationale:** Version control should track data schemas, not user data.

**Implementation:**
```
# .gitignore
/server/data/*.js
!/server/data/foodLibrary.js
!/server/data/lastReset.js
!/server/data/record.js
!/server/data/today.js
!/server/data/user.js
!/server/data/nutrientCalculator.js
!/server/data/foodDeletedLibrary.js
!/server/data/README.md
```

This keeps template files in git while excluding actual user data if it ever gets generated in that directory.

### 2. Environment-Based Data Paths
**Rationale:** Development and production need different data locations.

**Implementation:**
Update `electron/dataPath.js` to differentiate between environments:
```javascript
// Development: Use source templates
// Production: Use user's app data directory
const isDev = process.env.NODE_ENV === 'development';
const dataPath = isDev 
  ? path.join(__dirname, '../server/data')
  : path.join(app.getPath('userData'), 'data');
```

**Production Locations:**
- **Windows:** `C:\Users\{username}\AppData\Roaming\FoodTracker\data\`
- **macOS:** `~/Library/Application Support/FoodTracker/data/`
- **Linux:** `~/.config/FoodTracker/data/`

### 3. Data Initialization Logic
**Rationale:** First-run setup ensures proper data structure without manual setup.

**Implementation:**
Create `electron/initializeData.js`:
```javascript
const fs = require('fs');
const path = require('path');
const sourceDir = path.join(__dirname, '../server/data');
const targetDir = process.env.NODE_ENV === 'development' 
  ? sourceDir 
  : path.join(app.getPath('userData'), 'data');

function initializeData() {
  // Create data directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy template files to target location on first run
  const templateFiles = [
    'foodLibrary.js',
    'lastReset.js',
    'record.js',
    'today.js',
    'user.js',
    'nutrientCalculator.js',
    'foodDeletedLibrary.js'
  ];

  templateFiles.forEach(file => {
    const targetFile = path.join(targetDir, file);
    if (!fs.existsSync(targetFile)) {
      const source = path.join(sourceDir, file);
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, targetFile);
      }
    }
  });
}

module.exports = { initializeData };
```

**Call on App Start:**
In `electron/main.cjs`, call `initializeData()` when the app launches.

### 4. Data Schema Documentation
**Rationale:** Clear documentation prevents confusion about data structure.

**Implementation:**
Enhance `server/data/README.md` with:
- Description of each file's purpose
- Expected data structure (JSON/object format)
- Example entries
- When/how data gets modified

Example structure:
```markdown
## foodLibrary.js
Array of food objects with nutritional info.
```[Format guide...]
```

## Production Checklist

- [ ] Environment variables configured (NODE_ENV)
- [ ] `initializeData()` called on app startup
- [ ] `.gitignore` updated to exclude runtime data
- [ ] `dataPath.js` uses environment-aware paths
- [ ] Template files committed to git
- [ ] `server/data/README.md` documents all schemas
- [ ] First-run initialization tested
- [ ] Data persistence verified across app restarts

## Benefits

✅ **Clean Version Control:** No user data in git  
✅ **Easy Deployment:** Templates initialize automatically  
✅ **Developer Friendly:** Clear schema examples  
✅ **User Privacy:** Data stored in user's local directories  
✅ **Resettable State:** Templates allow data reset/recovery  
✅ **Scalable:** Works across Windows/Mac/Linux

## Future Enhancements

- Add data migration logic for schema updates
- Implement data export/import functionality
- Add automatic backups to user data directory
- Consider encryption for sensitive data (calories, weights, etc.)
