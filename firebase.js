import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyDHnDFe-sg7hc4I8jSEHR7wIlHUnLfUA8A",
  authDomain: "poultry-record.firebaseapp.com",
  projectId: "poultry-record",
  storageBucket: "poultry-record.appspot.com",
 //storageBucket: "poultry-record.firebasestorage.app",
  messagingSenderId: "476624930714",
  appId: "1:476624930714:web:d7847899b8e1f3eb4d5c23"
});

/* ================= TRANSLATIONS ================= */
export const translations = {
  en: {
    "Dashboard": "Dashboard",
    "View Chart": "View Chart",
    "Share Chart": "Share Chart",
    "Logout": "Logout",
    "Back": "Back",
    "Save": "Save",
    "Update Bill": "Update Bill",
    "Bill No": "Bill No",
    "Date": "Date",
    "Farmer Name": "Farmer Name",
    "Trader Name": "Trader Name",
    "Vehicle No": "Vehicle No",
    "Total Birds": "Total Birds",
    "Gross Weight": "Gross Weight",
    "Empty Weight": "Empty Weight",
    "Net Weight": "Net Weight",
    "Weights": "Weights",
    "Bird Details": "Bird Details",
    "Trader Sign": "Trader Sign",
    "Supervisor Sign": "Supervisor Sign",
    "Delivery Challan": "DELIVERY CHALLAN",
    "Login": "Login",
    "Register": "Register",
    "Email": "Email",
    "Password": "Password",
    "Forgot Password?": "Forgot Password?",
    "Please fill all fields": "Please fill all fields",
    "Bill saved successfully": "Bill saved successfully",
    "Unsaved changes": "You have unsaved changes. Are you sure you want to leave?",
    "Consolidated Bill PDF": "Consolidated Bill PDF",
    "Crates": "Crates",
    "Birds / Crate": "Birds / Crate",
    "No. of Birds": "No. of Birds",
    "Sl": "Sl",
    "Empty Weight (kg)": "Empty Weight (kg)",
    "Gross Weight (kg)": "Gross Weight (kg)",
    "Daily Entry": "Daily Entry",
    "Bill Entry": "Bill Entry",
    "Bill Book": "Bill Book",
    "Switch Batch": "Switch Batch",
    "Poultry Manager": "Poultry Manager",
    "Performance Summary": "Performance Summary",
    "Live Birds": "Live Birds",
    "Mortality %": "Mortality %",
    "Avg BW (g)": "Avg BW (g)",
    "FCR": "FCR",
    "Body Weight Trend": "Body Weight Trend",
    "FCR Trend": "FCR Trend",
    "Mortality Trend": "Mortality Trend",
    "Consolidated Bill Report": "Consolidated Bill Report",
    "Generated": "Generated",
    "Total Feed Used": "Total Feed Used",
    "Feed Remaining": "Feed Remaining",
    "Avg Sales Weight": "Avg Sales Weight",
    "bags": "bags",
    "kg": "kg",
    "TOTAL": "TOTAL",
    "No bills found to consolidate.": "No bills found to consolidate.",
    "View": "View",
    "Edit": "Edit",
    "Current Batch": "Current Batch",
    "Previous Batches": "Previous Batches",
    "No active batches.": "No active batches.",
    "No history available.": "No history available.",
    "Saved successfully": "Saved successfully",
    "Day": "Day",
    "BROILER PERFORMANCE RECORD": "BROILER PERFORMANCE RECORD",
    "Hatchery": "Hatchery",
    "Batch": "Batch",
    "Farmer": "Farmer",
    "Trader": "Trader",
    "Login Successful!": "Login Successful!",
    "Logging in...": "Logging in...",
    "Please enter email and password": "Please enter email and password",
    "Authentication failed. Try again.": "Authentication failed. Try again.",
    "Email not registered": "Email not registered",
    "Incorrect password.": "Incorrect password.",
    "Invalid email format.": "Invalid email format.",
    "Email already registered. Please login.": "Email already registered. Please login.",
    "Password must be at least 6 characters.": "Password must be at least 6 characters.",
    "Enter your email to reset password": "Enter your email to reset password",
    "Password reset link sent. Check inbox or spam.": "Password reset link sent. Check inbox or spam.",
    "Failed to send reset email": "Failed to send reset email",
    "Invalid bill": "Invalid bill",
    "Bill not found": "Bill not found",
    "Sharing not supported": "Sharing not supported",
    "Save failed – check console": "Save failed – check console",
    "Selected batch not found": "Selected batch not found",
    "No daily data available yet": "No daily data available yet",
    "BW Actual": "BW Actual",
    "BW Std": "BW Std",
    "FCR Actual": "FCR Actual",
    "FCR Std": "FCR Std",
    "Daily Poultry Chart": "Daily Poultry Chart",
    "Legacy Batch": "Legacy Batch",
    "Vaccination saved": "Vaccination saved",
    "Select at least one image": "Select at least one image",
    "Inputs": "Inputs",
    "Mortality (number of birds died today)": "Mortality (number of birds died today)",
    "Feed Received (bags)": "Feed Received (bags)",
    "Feed Used (bags)": "Feed Used (bags)",
    "Average Body Weight (grams)": "Average Body Weight (grams)",
    "Auto Calculated": "Auto Calculated",
    "Mortality Total": "Mortality Total",
    "Feed Balance (kg)": "Feed Balance (kg)",
    "Feed Intake Std (g)": "Feed Intake Std (g)",
    "Feed Intake Actual (g)": "Feed Intake Actual (g)",
    "Cum Feed Std (g)": "Cum Feed Std (g)",
    "Cum Feed Actual (g)": "Cum Feed Actual (g)",
    "Body Wt Min (g)": "Body Wt Min (g)",
    "Save Entry": "Save Entry",
    "DELIVERY CHALLAN FOR BIRDS": "DELIVERY CHALLAN FOR BIRDS",
    "Empty Weights": "Empty Weights",
    "Gross Weights": "Gross Weights",
    "Add Empty": "+ Add Empty",
    "Add Gross": "+ Add Gross",
    "Add Row": "+ Add Row",
    "Select Batch": "Select Batch",
    "Choose an existing batch or start a new one.": "Choose an existing batch or start a new one.",
    "Start New Batch": "Start New Batch",
    "Back to Dashboard": "Back to Dashboard",
    "Poultry Dashboard": "Poultry Dashboard",
    "Login Failed": "Login Failed",
    "Save Bill": "Save Bill",
    "Gross": "Gross",
    "Empty": "Empty",
    "Net": "Net",
    "Total": "Total",
    "Back to Login": "Back to Login",
    "Sales Analysis": "Sales Analysis",
    "Batch FCR": "Batch FCR",
    "CFCR": "CFCR",
    "Total Net Wt": "Total Net Wt",
    "Rate": "Rate",
    "Total Revenue": "Total Revenue",
    "Vaccination": "Vaccination",
    "Vaccine Name": "Vaccine Name",
    "Administered Date": "Administered Date",
    "Notes": "Notes",
    "Add Record": "Add Record",
    "Vaccination History": "Vaccination History",
    "Photo": "Photo",
    "Cost": "Cost",
    "Weight": "Weight",
    "Create New Batch": "Create New Batch",
    "Fill details to start a new batch. Previous active batch will be closed automatically.": "Fill details to start a new batch. Previous active batch will be closed automatically.",
    "Farmer / Farm Name": "Farmer / Farm Name",
    "Hatchery Name": "Hatchery Name",
    "Hatchery Code": "Hatchery Code",
    "Batch / Shed Code": "Batch / Shed Code",
    "Batch Start Date": "Batch Start Date",
    "Total Chicks Placed": "Total Chicks Placed",
    "Save & Start Batch": "Save & Start Batch",
    "Cancel": "Cancel",
    "Poultry Daily Record": "Poultry Daily Record",
    "Your full name": "Your full name",
    "e.g. 2": "e.g. 2",
    "e.g. 0": "e.g. 0",
    "e.g. 5": "e.g. 5",
    "e.g. 180": "e.g. 180",
    "e.g. Lasota, Gumboro": "e.g. Lasota, Gumboro",
    "Optional notes": "Optional notes",
    "e.g. 4700": "e.g. 4700"
  },
  kn: {
    "Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "View Chart": "ಚಾರ್ಟ್ ವೀಕ್ಷಿಸಿ",
    "Share Chart": "ಚಾರ್ಟ್ ಹಂಚಿಕೊಳ್ಳಿ",
    "Logout": "ಲಾಗ್ ಔಟ್",
    "Back": "ಹಿಂದಕ್ಕೆ",
    "Save": "ಉಳಿಸಿ",
    "Update Bill": "ಬಿಲ್ ನವೀಕರಿಸಿ",
    "Bill No": "ಬಿಲ್ ಸಂಖ್ಯೆ",
    "Date": "ದಿನಾಂಕ",
    "Farmer Name": "ರೈತ ಹೆಸರು",
    "Trader Name": "ವ್ಯಾಪಾರಿ ಹೆಸರು",
    "Vehicle No": "ವಾಹನ ಸಂಖ್ಯೆ",
    "Total Birds": "ಒಟ್ಟು ಪಕ್ಷಿಗಳು",
    "Gross Weight": "ಒಟ್ಟು ತೂಕ",
    "Empty Weight": "ಖಾಲಿ ತೂಕ",
    "Net Weight": "ನಿವ್ವಳ ತೂಕ",
    "Weights": "ತೂಕಗಳು",
    "Bird Details": "ಪಕ್ಷಿ ವಿವರಗಳು",
    "Trader Sign": "ವ್ಯಾಪಾರಿ ಸಹಿ",
    "Supervisor Sign": "ಮೇಲ್ವಿಚಾರಕ ಸಹಿ",
    "Delivery Challan": "ಡೆಲಿವರಿ ಚಲನ್",
    "Login": "ಲಾಗಿನ್",
    "Register": "ನೋಂದಾಯಿಸಿ",
    "Email": "ಇಮೇಲ್",
    "Password": "ಪಾಸ್‌ವರ್ಡ್",
    "Forgot Password?": "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
    "Please fill all fields": "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ",
    "Bill saved successfully": "ಬಿಲ್ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ",
    "Unsaved changes": "ನೀವು ಉಳಿಸದ ಬದಲಾವಣೆಗಳನ್ನು ಹೊಂದಿದ್ದೀರಿ. ನೀವು ಖಚಿತವಾಗಿ ನಿರ್ಗಮಿಸಲು ಬಯಸುವಿರಾ?",
    "Consolidated Bill PDF": "ಏಕೀಕೃತ ಬಿಲ್ ಪಿಡಿಎಫ್",
    "Crates": "ಕ್ರೇಟ್‌ಗಳು",
    "Birds / Crate": "ಪಕ್ಷಿಗಳು / ಕ್ರೇಟ್",
    "No. of Birds": "ಪಕ್ಷಿಗಳ ಸಂಖ್ಯೆ",
    "Sl": "ಕ್ರಮ ಸಂಖ್ಯೆ",
    "Empty Weight (kg)": "ಖಾಲಿ ತೂಕ (ಕೆಜಿ)",
    "Gross Weight (kg)": "ಒಟ್ಟು ತೂಕ (ಕೆಜಿ)",
    "Daily Entry": "ದೈನಂದಿನ ದಾಖಲೆ",
    "Bill Entry": "ಬಿಲ್ ನಮೂದು",
    "Bill Book": "ಬಿಲ್ ಪುಸ್ತಕ",
    "Switch Batch": "ಬ್ಯಾಚ್ ಬದಲಾಯಿಸಿ",
    "Poultry Manager": "ಪೌಲ್ಟ್ರಿ ಮ್ಯಾನೇಜರ್",
    "Performance Summary": "ಕಾರ್ಯಕ್ಷಮತೆ ಸಾರಾಂಶ",
    "Live Birds": "ಜೀವಂತ ಪಕ್ಷಿಗಳು",
    "Mortality %": "ಸಾವು %",
    "Avg BW (g)": "ಸರಾಸರಿ ತೂಕ (ಗ್ರಾಂ)",
    "FCR": "ಎಫ್.ಸಿ.ಆರ್",
    "Body Weight Trend": "ದೇಹದ ತೂಕದ ಪ್ರವೃತ್ತಿ",
    "FCR Trend": "ಎಫ್.ಸಿ.ಆರ್ ಪ್ರವೃತ್ತಿ",
    "Mortality Trend": "ಸಾವು ಪ್ರವೃತ್ತಿ",
    "Consolidated Bill Report": "ಏಕೀಕೃತ ಬಿಲ್ ವರದಿ",
    "Generated": "ರಚಿಸಲಾಗಿದೆ",
    "Total Feed Used": "ಒಟ್ಟು ಬಳಸಿದ ಆಹಾರ",
    "Feed Remaining": "ಉಳಿದ ಆಹಾರ",
    "Avg Sales Weight": "ಸರಾಸರಿ ಮಾರಾಟ ತೂಕ",
    "bags": "ಚೀಲಗಳು",
    "kg": "ಕೆಜಿ",
    "TOTAL": "ಒಟ್ಟು",
    "No bills found to consolidate.": "ಕ್ರೋಢೀಕರಿಸಲು ಯಾವುದೇ ಬಿಲ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    "View": "ವೀಕ್ಷಿಸಿ",
    "Edit": "ತಿದ್ದು",
    "Current Batch": "ಪ್ರಸ್ತುತ ಬ್ಯಾಚ್",
    "Previous Batches": "ಹಿಂದಿನ ಬ್ಯಾಚ್‌ಗಳು",
    "No active batches.": "ಯಾವುದೇ ಸಕ್ರಿಯ ಬ್ಯಾಚ್‌ಗಳಿಲ್ಲ.",
    "No history available.": "ಯಾವುದೇ ಇತಿಹಾಸ ಲಭ್ಯವಿಲ್ಲ.",
    "Saved successfully": "ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ",
    "Day": "ದಿನ",
    "BROILER PERFORMANCE RECORD": "ಬ್ರಾಯ್ಲರ್ ಕಾರ್ಯಕ್ಷಮತೆ ದಾಖಲೆ",
    "Hatchery": "ಹ್ಯಾಚರಿ",
    "Batch": "ಬ್ಯಾಚ್",
    "Farmer": "ರೈತ",
    "Trader": "ವ್ಯಾಪಾರಿ",
    "Login Successful!": "ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!",
    "Logging in...": "ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...",
    "Please enter email and password": "ದಯವಿಟ್ಟು ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    "Authentication failed. Try again.": "ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    "Email not registered": "ಇಮೇಲ್ ನೋಂದಾಯಿಸಲಾಗಿಲ್ಲ",
    "Incorrect password.": "ತಪ್ಪು ಪಾಸ್‌ವರ್ಡ್.",
    "Invalid email format.": "ಅಮಾನ್ಯ ಇಮೇಲ್ ಸ್ವರೂಪ.",
    "Email already registered. Please login.": "ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.",
    "Password must be at least 6 characters.": "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು.",
    "Enter your email to reset password": "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಲು ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ",
    "Password reset link sent. Check inbox or spam.": "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ. ಇನ್‌ಬಾಕ್ಸ್ ಅಥವಾ ಸ್ಪ್ಯಾಮ್ ಪರಿಶೀಲಿಸಿ.",
    "Failed to send reset email": "ಮರುಹೊಂದಿಸುವ ಇಮೇಲ್ ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ",
    "Invalid bill": "ಅಮಾನ್ಯ ಬಿಲ್",
    "Bill not found": "ಬಿಲ್ ಕಂಡುಬಂದಿಲ್ಲ",
    "Sharing not supported": "ಹಂಚಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ",
    "Save failed – check console": "ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ - ಕನ್ಸೋಲ್ ಪರಿಶೀಲಿಸಿ",
    "Selected batch not found": "ಆಯ್ಕೆಮಾಡಿದ ಬ್ಯಾಚ್ ಕಂಡುಬಂದಿಲ್ಲ",
    "No daily data available yet": "ಇನ್ನೂ ಯಾವುದೇ ದೈನಂದಿನ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ",
    "BW Actual": "ತೂಕ ನೈಜ",
    "BW Std": "ತೂಕ ನಿರೀಕ್ಷಿತ",
    "FCR Actual": "ಎಫ್.ಸಿ.ಆರ್ ನೈಜ",
    "FCR Std": "ಎಫ್.ಸಿ.ಆರ್ ನಿರೀಕ್ಷಿತ",
    "Daily Poultry Chart": "ದೈನಂದಿನ ಪೌಲ್ಟ್ರಿ ಚಾರ್ಟ್",
    "Legacy Batch": "ಹಳೆಯ ಬ್ಯಾಚ್",
    "Vaccination saved": "ಲಸಿಕೆ ಉಳಿಸಲಾಗಿದೆ",
    "Select at least one image": "ಕನಿಷ್ಠ ಒಂದು ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "Inputs": "ಮಾಹಿತಿ ನಮೂದಿಸಿ",
    "Mortality (number of birds died today)": "ಸಾವು (ಇಂದು ಸತ್ತ ಪಕ್ಷಿಗಳ ಸಂಖ್ಯೆ)",
    "Feed Received (bags)": "ಸ್ವೀಕರಿಸಿದ ಆಹಾರ (ಚೀಲಗಳು)",
    "Feed Used (bags)": "ಬಳಸಿದ ಆಹಾರ (ಚೀಲಗಳು)",
    "Average Body Weight (grams)": "ಸರಾಸರಿ ದೇಹದ ತೂಕ (ಗ್ರಾಂ)",
    "Auto Calculated": "ಸ್ವಯಂಚಾಲಿತ ಲೆಕ್ಕಾಚಾರ",
    "Mortality Total": "ಒಟ್ಟು ಸಾವು",
    "Feed Balance (kg)": "ಉಳಿದ ಆಹಾರ (ಕೆಜಿ)",
    "Feed Intake Std (g)": "ಆಹಾರ ಸೇವನೆ ನಿರೀಕ್ಷಿತ (ಗ್ರಾಂ)",
    "Feed Intake Actual (g)": "ಆಹಾರ ಸೇವನೆ ನೈಜ (ಗ್ರಾಂ)",
    "Cum Feed Std (g)": "ಒಟ್ಟು ಆಹಾರ ನಿರೀಕ್ಷಿತ (ಗ್ರಾಂ)",
    "Cum Feed Actual (g)": "ಒಟ್ಟು ಆಹಾರ ನೈಜ (ಗ್ರಾಂ)",
    "Body Wt Min (g)": "ದೇಹದ ತೂಕ ಕನಿಷ್ಠ (ಗ್ರಾಂ)",
    "Save Entry": "ದಾಖಲೆಯನ್ನು ಉಳಿಸಿ",
    "DELIVERY CHALLAN FOR BIRDS": "ಪಕ್ಷಿಗಳ ಡೆಲಿವರಿ ಚಲನ್",
    "Empty Weights": "ಖಾಲಿ ತೂಕಗಳು",
    "Gross Weights": "ಒಟ್ಟು ತೂಕಗಳು",
    "Add Empty": "+ ಖಾಲಿ ತೂಕ ಸೇರಿಸಿ",
    "Add Gross": "+ ಒಟ್ಟು ತೂಕ ಸೇರಿಸಿ",
    "Add Row": "+ ಸಾಲನ್ನು ಸೇರಿಸಿ",
    "Select Batch": "ಬ್ಯಾಚ್ ಆಯ್ಕೆಮಾಡಿ",
    "Choose an existing batch or start a new one.": "ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಬ್ಯಾಚ್ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಹೊಸದನ್ನು ಪ್ರಾರಂಭಿಸಿ.",
    "Start New Batch": "ಹೊಸ ಬ್ಯಾಚ್ ಪ್ರಾರಂಭಿಸಿ",
    "Back to Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    "Poultry Dashboard": "ಪೌಲ್ಟ್ರಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Login Failed": "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ",
    "Save Bill": "ಬಿಲ್ ಉಳಿಸಿ",
    "Gross": "ಒಟ್ಟು",
    "Empty": "ಖಾಲಿ",
    "Net": "ನಿವ್ವಳ",
    "Total": "ಒಟ್ಟು",
    "Back to Login": "ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    "Sales Analysis": "ಮಾರಾಟ ವಿಶ್ಲೇಷಣೆ",
    "Batch FCR": "ಬ್ಯಾಚ್ FCR",
    "CFCR": "CFCR",
    "Total Net Wt": "ಒಟ್ಟು ನಿವ್ವಳ ತೂಕ",
    "Rate": "ದರ",
    "Total Revenue": "ಒಟ್ಟು ಆದಾಯ",
    "Vaccination": "ಲಸಿಕೆ",
    "Vaccine Name": "ಲಸಿಕೆ ಹೆಸರು",
    "Administered Date": "ನೀಡಿದ ದಿನಾಂಕ",
    "Notes": "ಟಿಪ್ಪಣಿಗಳು",
    "Add Record": "ದಾಖಲೆ ಸೇರಿಸಿ",
    "Vaccination History": "ಲಸಿಕೆ ಇತಿಹಾಸ",
    "Photo": "ಫೋಟೋ",
    "Cost": "ವೆಚ್ಚ",
    "Weight": "ತೂಕ",
    "Create New Batch": "ಹೊಸ ಬ್ಯಾಚ್ ರಚಿಸಿ",
    "Fill details to start a new batch. Previous active batch will be closed automatically.": "ಹೊಸ ಬ್ಯಾಚ್ ಪ್ರಾರಂಭಿಸಲು ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ. ಹಿಂದಿನ ಸಕ್ರಿಯ ಬ್ಯಾಚ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮುಚ್ಚಲ್ಪಡುತ್ತದೆ.",
    "Farmer / Farm Name": "ರೈತ / ಫಾರ್ಮ್ ಹೆಸರು",
    "Hatchery Name": "ಹ್ಯಾಚರಿ ಹೆಸರು",
    "Hatchery Code": "ಹ್ಯಾಚರಿ ಕೋಡ್",
    "Batch / Shed Code": "ಬ್ಯಾಚ್ / ಶೆಡ್ ಕೋಡ್",
    "Batch Start Date": "ಬ್ಯಾಚ್ ಪ್ರಾರಂಭ ದಿನಾಂಕ",
    "Total Chicks Placed": "ಒಟ್ಟು ಮರಿಗಳು",
    "Save & Start Batch": "ಉಳಿಸಿ ಮತ್ತು ಬ್ಯಾಚ್ ಪ್ರಾರಂಭಿಸಿ",
    "Cancel": "ರದ್ದುಮಾಡಿ",
    "Poultry Daily Record": "ಪೌಲ್ಟ್ರಿ ದೈನಂದಿನ ದಾಖಲೆ",
    "Your full name": "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು",
    "e.g. 2": "ಉದಾ. 2",
    "e.g. 0": "ಉದಾ. 0",
    "e.g. 5": "ಉದಾ. 5",
    "e.g. 180": "ಉದಾ. 180",
    "e.g. Lasota, Gumboro": "ಉದಾ. ಲಸೋಟ, ಗುಂಬೊರೊ",
    "Optional notes": "ಐಚ್ಛಿಕ ಟಿಪ್ಪಣಿಗಳು",
    "e.g. 4700": "ಉದಾ. 4700"
  }
};

export function getLang() {
  return localStorage.getItem("appLang") || "en";
}

export function t(key) {
  const lang = getLang();
  return (translations[lang] && translations[lang][key]) || key;
}

export function translateCommonElements() {
  const setTxt = (sel, key) => {
    const el = document.querySelector(sel);
    if (el) {
        const icon = el.querySelector("i");
        if (icon) {
            el.innerHTML = "";
            el.appendChild(icon);
            el.append(" " + t(key));
        } else {
            el.innerText = t(key);
        }
    }
  };

  setTxt("button.nav-item[onclick*='dashboard.html']", "Dashboard");
  setTxt("button[onclick*='entry.html']", "Daily Entry");
  setTxt("button[onclick*='vaccination.html']", "Vaccination");
  setTxt("button[onclick*='billing.html']", "Bill Entry");
  setTxt("button[onclick*='billing-history.html']", "Bill Book");
  setTxt("button[onclick*='batch.html']", "Switch Batch");
  setTxt("#logoutBtn", "Logout");
  setTxt(".sidebar-header h3", "Poultry Manager");
  setTxt("#viewChartBtn", "View Chart");
  setTxt("#shareChartBtn", "Share Chart");

  /* ================= DARK MODE TOGGLE ================= */
  const sidebar = document.querySelector(".sidebar");
  if (sidebar && !document.getElementById("themeToggle")) {
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "themeToggle";
    toggleBtn.className = "nav-item";
    toggleBtn.style.marginTop = "auto"; // Push to bottom
    toggleBtn.style.marginBottom = "10px";
    
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) document.documentElement.setAttribute("data-theme", "dark");
    
    const updateBtn = () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      toggleBtn.innerHTML = dark 
        ? `<i>☀️</i> ${t("Light Mode")}` 
        : `<i>🌙</i> ${t("Dark Mode")}`;
    };
    
    updateBtn();
    
    toggleBtn.onclick = () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateBtn();
      if (sidebar) sidebar.classList.remove("open");
    };
    
    // Insert before logout if possible
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) sidebar.insertBefore(toggleBtn, logoutBtn);
    else sidebar.appendChild(toggleBtn);

    /* ================= LANGUAGE TOGGLE ================= */
    const langBtn = document.createElement("button");
    langBtn.className = "nav-item";
    langBtn.style.marginBottom = "5px";
    
    const curLang = getLang();
    langBtn.innerHTML = curLang === "en" ? "<i>🗣️</i> ಕನ್ನಡ" : "<i>🗣️</i> English";
    
    langBtn.onclick = () => {
      const next = curLang === "en" ? "kn" : "en";
      localStorage.setItem("appLang", next);
      location.reload();
    };

    if (logoutBtn) sidebar.insertBefore(langBtn, logoutBtn);
    else sidebar.appendChild(langBtn);
  }
}
