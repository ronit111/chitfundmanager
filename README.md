# Chit Fund Manager (Feature Guide)

This app helps you manage chit fund groups with an intuitive dashboard and clear separation between active and archived groups. Below are the key features and how to use them:

---

## Dashboard Overview
- **Active Groups:** Lists all ongoing chit groups. You can view, edit, duplicate, or archive any group here.
- **Archived Groups:** Lists groups you have archived. You can restore them to active status or permanently delete them.

---

## Features & Usage

### 1. Create a New Group
- Click **+ Create New Group**.
- Fill in group name, number of months, and lumpsum value.
- Click **Save** to add it to your Active Groups.

### 2. Archive a Group
- In the Active Groups list, click a group to view details.
- Click **Archive Group**. The group will move to the Archived Groups section.

### 3. Restore or Delete Forever
- In the Archived Groups section, use **Restore** to move a group back to Active.
- Use **Delete Forever** to permanently remove a group from your records.
  - (You can only delete a group forever after it has been archived for at least 1 month.)

### 4. Duplicate a Group
- In any group’s details, click **Duplicate Group**.
- The app creates a new group with the same properties (except members/payments).
- If any required fields (months, lumpsum) are missing, the edit form will open and prompt you to fill them before saving.
- Once saved, the duplicate appears instantly in Active Groups.

### 5. Edit Restrictions
- Once payments have started for a group, the **Number of Months** and **Lumpsum Value** fields cannot be changed.
- The edit form displays a message explaining why these fields are disabled.

---

## Recent Fixes & Improvements (May 2025)

### Variable Payout Groups
- The Winner Payout Schedule now correctly uses a formula for variable chit groups, instead of always showing the lumpsum value.
- You can set a group as "Variable" or "Constant" in the Edit Group form. This chit type is now always saved and used for payout calculations.
- The payout amounts for variable groups are calculated using your custom formula (see code comments in `PaymentSchedule.js`).

### Edit Group Form
- The chit type selector is now always visible when editing a group (unless payments have started).
- All fields (including start month) are properly initialized and persist across edits.

### Debugging & Troubleshooting
- If the payout schedule doesn't look correct, check that the group is set to the correct chit type ("variable" or "constant").
- If you change a group's chit type, make sure to save and reload to see the updated payout logic.
- All debug code and logs have been removed for production use, but you can add them back for troubleshooting if needed.

### Navigation Improvements
- The Dashboard button in the sidebar now properly navigates users back to the dashboard from any page.
- On mobile devices, the sidebar automatically closes after navigation for a better user experience.
- This provides a consistent way to return to the main dashboard view from anywhere in the application.

### Learning Notes
- This project demonstrates how to use React state and Firestore together for dynamic business logic.
- The codebase is commented for learners, especially around tricky logic like payout calculations and form state.
- The navigation system shows proper implementation of Material UI v5 components and React state management.

---

## Payment Buckets: Flexible Member Payment Rules

When creating or editing a chit group, you can now define exactly how much each member should pay in three scenarios:
- **Before Winning Month:** The amount a member pays each month until they win the chit.
- **In Winning Month:** The amount a member pays in the month they win. (Defaults to the same as before winning, but can be changed if your group rules require it.)
- **After Winning Month:** The amount a member pays in all months after they have won. (Defaults to the same as before winning, but can be changed.)

This allows you to model real-world chit fund rules, where a member’s payment may decrease after they win, or stay the same.

**How to use:**
- These fields are required when creating a new group.
- You can edit them for existing groups (unless payments have started).
- The payment schedule will automatically update to use these values for each member and month.

---

## Lumpsum Value: For Reference Only

- The **Lumpsum Value** field represents the total value of the chit for each cycle.
- It is **not** used to calculate how much each member pays each month.
- Actual member payments are controlled by the payment buckets described above.

---

## Overpayment Validation: Strict and Transparent

- The app checks each payment against what the member is expected to pay for that month (according to the group’s payment buckets and their winning status).
- If a member pays even 1 rupee above their expected amount, an orange flag (⚑) appears next to their payment.
- This helps prevent mistakes and ensures everyone follows the group’s rules exactly.

**Example:**  
If a member’s expected payment is ₹1000 for a month, and they pay ₹1001 or more, a flag will appear.

---

## Payment Schedule: Local-First + Firestore Sync

- The payment schedule UI uses local React state for instant feedback and a smooth user experience.
- All edits are saved to Firestore in the background for persistence.
- The UI is never blocked or reset by Firestore fetches after the initial load.
- If a save fails, the user is notified and can retry.
- This approach ensures a fast, user-friendly experience even with network delays.
- For real-time sync across devices, a Firestore listener can be added to merge remote changes.

## Payment Entry and Locking Rules

- **Editable:** Payment fields are editable for the current and future months, and for the previous month until the next month's due date passes.
- **Last Month:** For the last month of a chit group, payment entry is allowed until the last day of that month (23:59:59 local time).
- **Locked:** Past months are automatically locked and become non-editable after their respective cutoff dates.

## Technical Stack
- React (frontend)
- Firebase Firestore (database)
- Firebase Hosting (deployment)

## How It Works
1. On initial load, payments are fetched from Firestore (or initialized if missing).
2. When you enter or change a payment, the UI updates instantly (local state).
3. Changes are saved to Firestore in the background.
4. If you reload, payments persist (assuming Firestore/network is available).

## Troubleshooting
- If you cannot enter payments, check for network issues or adblockers blocking Firestore requests.
- If you see errors, they will appear in the UI for easy debugging.

## Learning Notes
- This project demonstrates best practices for combining local React state with Firestore for a responsive, robust app.
- All business rules are clearly commented in the code for learning and future maintenance.
- The app is built with React for a smooth and modern user experience.
- The dashboard always refreshes to show the latest changes after any action (archive, restore, duplicate, create, delete).

---

## For Beginners
- All features are designed to be intuitive and provide clear feedback.
- If you try to save a group with missing required fields, the app will show a helpful message.
- Archived groups never clutter your main dashboard.

---

For any issues or questions, check the code comments—they are written to help you learn!

---

## Deployment Guide

### Firebase Hosting Setup
1. **Install Firebase CLI**: `npm install -g firebase-tools`
2. **Login to Firebase**: `firebase login`
3. **Initialize Firebase**: `firebase init` (select Hosting and your Firebase project)
4. **Build the app**: `npm run build`
5. **Deploy**: `firebase deploy`

### Environment Variables
This app uses environment variables for Firebase configuration. Create a `.env` file in the root directory with these variables:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Git Repository Setup
1. **Initialize Git**: `git init`
2. **Add files**: `git add .`
3. **Initial commit**: `git commit -m "Initial commit"`
4. **Add remote repository**: `git remote add origin your_repository_url`
5. **Push to remote**: `git push -u origin main`

**Note**: The `.env` file is included in `.gitignore` to prevent sensitive information from being committed to the repository.

---

# (Original Create React App instructions below)
