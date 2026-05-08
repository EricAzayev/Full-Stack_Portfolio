import { getDatabase } from "../database/db.js";

/**
 * User Profile Data Access Layer
 */

/**
 * Get user profile
 * @returns {Object|null} User profile object or null if not exists
 */
export function getUser() {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      name, age, gender, height, weight, 
      activity_level as activityLevel,
      calorie_goal as calorieGoal
    FROM user_profile
    WHERE id = 1
  `);
  
  return stmt.get();
}

/**
 * Create or update user profile
 * @param {Object} userData User profile data
 * @returns {Object} The saved user profile
 */
export function saveUser(userData) {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    INSERT INTO user_profile (
      id, name, age, gender, height, weight, 
      activity_level, calorie_goal
    ) VALUES (
      1, @name, @age, @gender, @height, @weight,
      @activityLevel, @calorieGoal
    )
    ON CONFLICT(id) DO UPDATE SET
      name = @name,
      age = @age,
      gender = @gender,
      height = @height,
      weight = @weight,
      activity_level = @activityLevel,
      calorie_goal = @calorieGoal
  `);
  
  stmt.run(userData);
  return getUser();
}

/**
 * Check if user exists
 * @returns {boolean} True if user exists
 */
export function userExists() {
  const db = getDatabase();
  const stmt = db.prepare("SELECT COUNT(*) as count FROM user_profile WHERE id = 1");
  const result = stmt.get();
  return result.count > 0;
}

export default {
  getUser,
  saveUser,
  userExists,
};
