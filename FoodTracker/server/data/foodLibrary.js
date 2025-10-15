const foodLibrary = {
  "Egg": {
    "Metadata": {
      "Category": "Protein",
      "ServingSize_g": 50,
      "Calories_kcal": 72,
      "IsProbiotic": false
    },
    "Nutrients": {
      "Protein_g": 6.3,
      "Carbohydrates_g": 0.6,
      "Fats_g": 5,
      "Omega3_DHA_EPA_mg": 93,
      "Vitamin_B12_mcg": 0.45,
      "Choline_mg": 147,
      "Magnesium_mg": 5,
      "Iron_mg": 0.9,
      "Zinc_mg": 0.6,
      "Calcium_mg": 28,
      "Vitamin_D_mcg": 1.025,
      "Vitamin_C_mg": 0,
      "Fiber_g": 0,
      "Collagen_g": 0
    },
    "CollagenSupport": {
      "DerivedFrom": [
        "Protein_g"
      ],
      "SupportsCollagenSynthesis": true
    },
    "Supports": {
      "Brain": [
        "Omega3_DHA_EPA_mg",
        "Vitamin_B12_mcg",
        "Choline_mg",
        "Magnesium_mg",
        "Iron_mg"
      ],
      "Muscle": [
        "Protein_g",
        "Vitamin_D_mcg",
        "Magnesium_mg",
        "Iron_mg",
        "Zinc_mg",
        "Calcium_mg"
      ],
      "Skin": [
        "Omega3_DHA_EPA_mg",
        "CollagenSupport",
        "Zinc_mg"
      ]
    },
    "Synergy": {
      "Vitamin_D_mcg": [
        "Calcium_mg"
      ]
    }
  },
  "Plain Yogurt": {
    "Metadata": {
      "Category": "Dairy",
      "ServingSize_g": 245,
      "Calories_kcal": 150,
      "IsProbiotic": true
    },
    "Nutrients": {
      "Protein_g": 8.5,
      "Carbohydrates_g": 11.4,
      "Fats_g": 8,
      "Omega3_DHA_EPA_mg": 30,
      "Vitamin_B12_mcg": 1,
      "Choline_mg": 37,
      "Magnesium_mg": 27,
      "Iron_mg": 0.1,
      "Zinc_mg": 1.1,
      "Calcium_mg": 296,
      "Vitamin_D_mcg": 1.4,
      "Vitamin_C_mg": 0,
      "Fiber_g": 0,
      "Collagen_g": 0
    },
    "CollagenSupport": {
      "DerivedFrom": [
        "Protein_g"
      ],
      "SupportsCollagenSynthesis": true
    },
    "Supports": {
      "Brain": [
        "Omega3_DHA_EPA_mg",
        "Vitamin_B12_mcg",
        "Choline_mg",
        "Magnesium_mg",
        "Iron_mg"
      ],
      "Muscle": [
        "Protein_g",
        "Vitamin_D_mcg",
        "Magnesium_mg",
        "Iron_mg",
        "Zinc_mg",
        "Calcium_mg"
      ],
      "Skin": [
        "Omega3_DHA_EPA_mg",
        "CollagenSupport",
        "Zinc_mg"
      ]
    },
    "Synergy": {
      "Vitamin_D_mcg": [
        "Calcium_mg"
      ]
    }
  },
  "Chipotle Chicken Bowl": {
    "Metadata": {
      "Category": "Fast Food",
      "ServingSize_g": 551,
      "Calories_kcal": 800,
      "IsProbiotic": false
    },
    "Nutrients": {
      "Protein_g": 52,
      "Carbohydrates_g": 74,
      "Fats_g": 30,
      "Omega3_DHA_EPA_mg": 50,
      "Vitamin_B12_mcg": 1.5,
      "Choline_mg": 120,
      "Magnesium_mg": 140,
      "Iron_mg": 5.6,
      "Zinc_mg": 6,
      "Calcium_mg": 350,
      "Vitamin_D_mcg": 0.2,
      "Vitamin_C_mg": 19,
      "Fiber_g": 11,
      "Collagen_g": 0
    },
    "CollagenSupport": {
      "DerivedFrom": [
        "Protein_g"
      ],
      "SupportsCollagenSynthesis": true
    },
    "Supports": {
      "Brain": [
        "Omega3_DHA_EPA_mg",
        "Vitamin_B12_mcg",
        "Choline_mg",
        "Magnesium_mg",
        "Iron_mg"
      ],
      "Muscle": [
        "Protein_g",
        "Vitamin_D_mcg",
        "Magnesium_mg",
        "Iron_mg",
        "Zinc_mg",
        "Calcium_mg"
      ],
      "Skin": [
        "Omega3_DHA_EPA_mg",
        "CollagenSupport",
        "Zinc_mg"
      ]
    },
    "Synergy": {
      "Vitamin_D_mcg": [
        "Calcium_mg"
      ]
    }
  }
}

export default foodLibrary;