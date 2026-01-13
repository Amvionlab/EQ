import React, { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../services/storage";
import { usePopup } from "../context/PopupContext";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaInfoCircle,
} from "react-icons/fa";

// Validation schemas
const AOF_SCHEMA = {
  "page_1": ["Customer ID", "Account Type", "Branch Code", "Product Name", "CKYC No", "Constitution Type", "Registration No", "Date of Incorporation", "Type of Operation", "Account Title", "Registered Address", "Country", "Communication Address", "Mobile No", "Email ID", "Designation", "Account Statement Mode", "Cheque Book Facility", "QR Code", "Business Nature", "Business Activity", "Declaration Date", "Rubber Stamp"],
  "page_2": ["Industry Name", "No of Employees", "Annual Turnover", "Expected Monthly Transactions", "Company Existence Since", "Business Purpose", "Cheque Amount", "Drawn on Bank", "Mode of Funding", "Signatory Name", "Gender", "Date of Birth", "Nationality", "Father Name", "Residential Address", "Mobile", "Email", "PAN", "Aadhaar", "Marital Status", "Occupation", "Annual Income", "PEP Declaration", "Signature"],
  "page_3": ["Nominee Name", "Nominee Relationship", "Nominee Address", "Witness Name", "Witness Signature"],
  "page_4": ["Entity Type", "Country of Incorporation", "Tax Residency", "TIN", "Controlling Person", "KYC Verified By", "Branch Manager Signature", "Verification Date"]
};

const AADHAAR_FIELDS = ["Name", "Address", "Aadhaar Number", "Date of Birth", "Gender", "Photograph", "QR Code"];
const PAN_FIELDS = ["Name", "PAN Number", "Father's Name", "Date of Birth", "Photograph"];

const CheckPage = () => {
  const { showModal } = usePopup();
  const [validationResults, setValidationResults] = useState([]);
  const [overallStatus, setOverallStatus] = useState("pending");

  useEffect(() => {
    performValidations();
  }, []);

  const normalizeString = (str) => {
    return str ? str.toString().toLowerCase().trim().replace(/\s+/g, " ") : "";
  };

  const getValueFromForm = (formData, page, field) => {
    if (!formData || !formData[page]) return null;
    return formData[page][field] || null;
  };

  // FORM VALIDATIONS
  const validateFormData = (formData) => {
    const results = [];
    
    // 1. Check page_1 Account Type
    const accountType = getValueFromForm(formData, "page_1", "Account Type");
    const accountTypeValid = accountType && normalizeString(accountType) === "current account";
    results.push({
      category: "FORM",
      type: "Account Type Validation",
      field: "Account Type",
      formValue: accountType || "Not Found",
      expectedValue: "CURRENT Account",
      isValid: accountTypeValid,
      message: accountTypeValid 
        ? "Account type is correctly set to CURRENT Account"
        : "Account type should be 'CURRENT Account'"
    });

    // 2. Check page_1 Account Statement Mode
    const statementMode = getValueFromForm(formData, "page_1", "Account Statement Mode");
    const statementModeValid = statementMode && 
      (normalizeString(statementMode).includes("email") || 
       normalizeString(statementMode).includes("physical"));
    results.push({
      category: "FORM",
      type: "Account Statement Mode",
      field: "Account Statement Mode",
      formValue: statementMode || "Not Found",
      expectedValue: "Email or Physical",
      isValid: statementModeValid,
      message: statementModeValid
        ? "Account statement mode is valid (Email/Physical)"
        : "Account statement mode must be either Email or Physical"
    });

    // 3-6. Mandatory field checks for page_2
    const mandatoryFields = [
      { field: "Mobile", page: "page_2" },
      { field: "Email", page: "page_2" },
      { field: "Marital Status", page: "page_2" },
      { field: "PEP Declaration", page: "page_2" }
    ];

    mandatoryFields.forEach(({ field, page }) => {
      const value = getValueFromForm(formData, page, field);
      const isValid = value && normalizeString(value) !== "n/a" && normalizeString(value) !== "";
      results.push({
        category: "FORM",
        type: `Mandatory Field: ${field}`,
        field: field,
        formValue: value || "Blank/N/A",
        expectedValue: "Non-blank, non-N/A value",
        isValid: isValid,
        message: isValid
          ? `${field} is properly filled`
          : `${field} is mandatory and cannot be blank or N/A`
      });
    });

    // 7. Verify nominee details
    const nomineeFields = [
      { field: "Nominee Name", page: "page_3" },
      { field: "Nominee Relationship", page: "page_3" },
      { field: "Nominee Address", page: "page_3" }
    ];

    const allNomineeFieldsFilled = nomineeFields.every(({ field, page }) => {
      const value = getValueFromForm(formData, page, field);
      return value && normalizeString(value) !== "";
    });

    results.push({
      category: "FORM",
      type: "Nominee Details Validation",
      field: "Nominee Information",
      formValue: allNomineeFieldsFilled ? "All fields filled" : "Some fields missing",
      expectedValue: "Nominee Name, Relationship, and Address must be filled",
      isValid: allNomineeFieldsFilled,
      message: allNomineeFieldsFilled
        ? "All nominee details are properly filled"
        : "Nominee Name, Relationship, and Address must be fully filled"
    });

    // 8. Country of Incorporation
    const country = getValueFromForm(formData, "page_4", "Country of Incorporation");
    const countryValid = country && normalizeString(country) === "india";
    results.push({
      category: "FORM",
      type: "Country Validation",
      field: "Country of Incorporation",
      formValue: country || "Not Found",
      expectedValue: "INDIA",
      isValid: countryValid,
      message: countryValid
        ? "Country of Incorporation is INDIA"
        : "Country of Incorporation must be INDIA"
    });

    return results;
  };

  // PAN VALIDATIONS
  const validatePANData = (formData, panData) => {
    const results = [];
    
    const flattenForm = (data) => {
      return Object.values(data).reduce((acc, page) => {
        if (page && typeof page === "object") {
          Object.assign(acc, page);
        }
        return acc;
      }, {});
    };

    const formFlat = flattenForm(formData);
    const panFlat = flattenForm(panData);

    // Helper to get value from flattened data
    const getFlattenedValue = (flatData, possibleKeys) => {
      for (const key of possibleKeys) {
        const normalizedKey = normalizeString(key);
        for (const [dataKey, value] of Object.entries(flatData)) {
          if (normalizeString(dataKey) === normalizedKey && value) {
            return value;
          }
        }
      }
      return null;
    };

    // 1. Name match
    const formName = getFlattenedValue(formFlat, ["Signatory Name", "Name", "Applicant Name"]);
    const panName = getFlattenedValue(panFlat, ["Name", "Full Name", "PAN Holder Name"]);
    const nameMatch = formName && panName && normalizeString(formName) === normalizeString(panName);
    results.push({
      category: "PAN",
      type: "Name Verification",
      field: "Name",
      formValue: formName || "Not Found",
      targetValue: panName || "Not Found",
      isValid: nameMatch,
      message: nameMatch
        ? "PAN name matches with form's signatory name"
        : "PAN name does not match form's signatory name"
    });

    // 2. PAN Number match
    const formPAN = getFlattenedValue(formFlat, ["PAN", "PAN Number", "PAN No"]);
    const panNumber = getFlattenedValue(panFlat, ["PAN Number", "PAN", "Number"]);
    const panMatch = formPAN && panNumber && normalizeString(formPAN) === normalizeString(panNumber);
    results.push({
      category: "PAN",
      type: "PAN Number Verification",
      field: "PAN Number",
      formValue: formPAN || "Not Found",
      targetValue: panNumber || "Not Found",
      isValid: panMatch,
      message: panMatch
        ? "PAN number matches"
        : "PAN number does not match"
    });

    // 3. Date of Birth match
    const formDOB = getFlattenedValue(formFlat, ["Date of Birth", "DOB", "Birth Date"]);
    const panDOB = getFlattenedValue(panFlat, ["Date of Birth", "DOB", "Birth Date"]);
    const dobMatch = formDOB && panDOB && normalizeString(formDOB) === normalizeString(panDOB);
    results.push({
      category: "PAN",
      type: "Date of Birth Verification",
      field: "Date of Birth",
      formValue: formDOB || "Not Found",
      targetValue: panDOB || "Not Found",
      isValid: dobMatch,
      message: dobMatch
        ? "Date of Birth matches"
        : "Date of Birth does not match"
    });

    // 4. Father's Name match
    const formFatherName = getFlattenedValue(formFlat, ["Father Name", "Father's Name", "Father Name"]);
    const panFatherName = getFlattenedValue(panFlat, ["Father's Name", "Father Name"]);
    const fatherNameMatch = formFatherName && panFatherName && 
      normalizeString(formFatherName) === normalizeString(panFatherName);
    results.push({
      category: "PAN",
      type: "Father's Name Verification",
      field: "Father's Name",
      formValue: formFatherName || "Not Found",
      targetValue: panFatherName || "Not Found",
      isValid: fatherNameMatch,
      message: fatherNameMatch
        ? "Father's name matches"
        : "Father's name does not match"
    });

    return results;
  };

  // AADHAR VALIDATIONS
  const validateAadharData = (formData, aadharData) => {
    const results = [];
    
    const flattenForm = (data) => {
      return Object.values(data).reduce((acc, page) => {
        if (page && typeof page === "object") {
          Object.assign(acc, page);
        }
        return acc;
      }, {});
    };

    const formFlat = flattenForm(formData);
    const aadharFlat = flattenForm(aadharData);

    const getFlattenedValue = (flatData, possibleKeys) => {
      for (const key of possibleKeys) {
        const normalizedKey = normalizeString(key);
        for (const [dataKey, value] of Object.entries(flatData)) {
          if (normalizeString(dataKey) === normalizedKey && value) {
            return value;
          }
        }
      }
      return null;
    };

    // 1. Name match
    const formName = getFlattenedValue(formFlat, ["Signatory Name", "Name", "Applicant Name"]);
    const aadharName = getFlattenedValue(aadharFlat, ["Name", "Full Name", "Aadhaar Holder Name"]);
    const nameMatch = formName && aadharName && normalizeString(formName) === normalizeString(aadharName);
    results.push({
      category: "AADHAR",
      type: "Name Verification",
      field: "Name",
      formValue: formName || "Not Found",
      targetValue: aadharName || "Not Found",
      isValid: nameMatch,
      message: nameMatch
        ? "Aadhaar name matches with form's signatory name"
        : "Aadhaar name does not match form's signatory name"
    });

    // 2. Aadhaar Number match
    const formAadhar = getFlattenedValue(formFlat, ["Aadhaar", "Aadhaar Number", "Aadhaar No"]);
    const aadharNumber = getFlattenedValue(aadharFlat, ["Aadhaar Number", "Number", "Aadhaar"]);
    const aadharMatch = formAadhar && aadharNumber && normalizeString(formAadhar) === normalizeString(aadharNumber);
    results.push({
      category: "AADHAR",
      type: "Aadhaar Number Verification",
      field: "Aadhaar Number",
      formValue: formAadhar || "Not Found",
      targetValue: aadharNumber || "Not Found",
      isValid: aadharMatch,
      message: aadharMatch
        ? "Aadhaar number matches"
        : "Aadhaar number does not match"
    });

    // 3. Address match
    const formAddress = getFlattenedValue(formFlat, ["Residential Address", "Address", "Communication Address"]);
    const aadharAddress = getFlattenedValue(aadharFlat, ["Address", "Residential Address"]);
    const addressMatch = formAddress && aadharAddress && normalizeString(formAddress) === normalizeString(aadharAddress);
    results.push({
      category: "AADHAR",
      type: "Address Verification",
      field: "Address",
      formValue: formAddress || "Not Found",
      targetValue: aadharAddress || "Not Found",
      isValid: addressMatch,
      message: addressMatch
        ? "Address matches"
        : "Address does not match"
    });

    // 4. Date of Birth match
    const formDOB = getFlattenedValue(formFlat, ["Date of Birth", "DOB", "Birth Date"]);
    const aadharDOB = getFlattenedValue(aadharFlat, ["Date of Birth", "DOB", "Birth Date"]);
    const dobMatch = formDOB && aadharDOB && normalizeString(formDOB) === normalizeString(aadharDOB);
    results.push({
      category: "AADHAR",
      type: "Date of Birth Verification",
      field: "Date of Birth",
      formValue: formDOB || "Not Found",
      targetValue: aadharDOB || "Not Found",
      isValid: dobMatch,
      message: dobMatch
        ? "Date of Birth matches"
        : "Date of Birth does not match"
    });

    // 5. Gender match
    const formGender = getFlattenedValue(formFlat, ["Gender", "Sex"]);
    const aadharGender = getFlattenedValue(aadharFlat, ["Gender", "Sex"]);
    const genderMatch = formGender && aadharGender && normalizeString(formGender) === normalizeString(aadharGender);
    results.push({
      category: "AADHAR",
      type: "Gender Verification",
      field: "Gender",
      formValue: formGender || "Not Found",
      targetValue: aadharGender || "Not Found",
      isValid: genderMatch,
      message: genderMatch
        ? "Gender matches"
        : "Gender does not match"
    });

    return results;
  };

  const performValidations = () => {
    // Load Data
    const formDataStr = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
    const panDataStr = localStorage.getItem(STORAGE_KEYS.PAN_DATA);
    const gstDataStr = localStorage.getItem(STORAGE_KEYS.GST_DATA);
    const aadharDataStr = localStorage.getItem(STORAGE_KEYS.AADHAR_DATA);

    if (!formDataStr) {
      setOverallStatus("no_form_data");
      return;
    }

    const formData = JSON.parse(formDataStr);
    const panData = panDataStr ? JSON.parse(panDataStr) : null;
    const aadharData = aadharDataStr ? JSON.parse(aadharDataStr) : null;

    const allResults = [];

    // Perform FORM validations
    const formResults = validateFormData(formData);
    allResults.push(...formResults);

    // Perform PAN validations if PAN data exists
    if (panData) {
      const panResults = validatePANData(formData, panData);
      allResults.push(...panResults);
    }

    // Perform AADHAR validations if Aadhar data exists
    if (aadharData) {
      const aadharResults = validateAadharData(formData, aadharData);
      allResults.push(...aadharResults);
    }

    setValidationResults(allResults);

    // Determine Overall Status
    if (allResults.length === 0) {
      setOverallStatus("no_validations");
    } else {
      const allPassed = allResults.every(result => result.isValid);
      setOverallStatus(allPassed ? "success" : "failure");

      // Trigger Popup after a short delay
      setTimeout(() => {
        showModal({
          title: allPassed ? "Verification Successful" : "Verification Failed",
          message: allPassed
            ? "All validations passed successfully."
            : "Some validations failed. Please review the highlighted errors.",
          type: allPassed ? "success" : "error",
          confirmText: "OK",
        });
      }, 500);
    }
  };

  if (overallStatus === "no_form_data") {
    return (
      <div style={{ 
        padding: "40px", 
        color: "#333", 
        textAlign: "center",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <FaExclamationTriangle
          style={{ fontSize: "48px", color: "#ff9800", marginBottom: "20px" }}
        />
        <h2 style={{ color: "#333", marginBottom: "10px" }}>Form Data Missing</h2>
        <p style={{ color: "#666", fontSize: "16px" }}>Please upload and scan the main Form Document first.</p>
      </div>
    );
  }

  // Group results by category
  const groupedResults = validationResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {});

  return (
    <div style={{
      backgroundColor: "#f5f5f5",
      minHeight: "100vh",
      overflowY: "auto",
    }}>
      <div style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "#333",
      }}>
      

        {/* Main Content - Scrollable Area */}
        <div style={{
          height: "calc(100vh - 120px)",
          overflowY: "auto",
          paddingRight: "10px",
          WebkitOverflowScrolling: "touch",
        }}>
          {overallStatus === "no_validations" && (
            <div style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid #e0e0e0",
            }}>
              <FaInfoCircle 
                style={{ fontSize: "36px", color: "#2196f3", marginBottom: "15px" }}
              />
              <p style={{ 
                color: "#666", 
                fontSize: "16px",
                margin: 0 
              }}>
                No validations to perform. Please check your data.
              </p>
            </div>
          )}

          {/* Render grouped results */}
          {Object.entries(groupedResults).map(([category, categoryResults]) => (
            <div
              key={category}
              style={{
                marginBottom: "25px",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* Section Header */}
              <div style={{
                backgroundColor: getCategoryColor(category),
                padding: "16px 24px",
                fontWeight: "600",
                borderBottom: "1px solid #e0e0e0",
                color: "#333",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <FaShieldAlt style={{ fontSize: "18px", color: getCategoryIconColor(category) }} />
                {category} Validations ({categoryResults.length})
              </div>

              {/* Validation Items */}
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {categoryResults.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: "20px 24px",
                      borderBottom: index !== categoryResults.length - 1 ? "1px solid #f0f0f0" : "none",
                      backgroundColor: result.isValid
                        ? "rgba(76, 175, 80, 0.05)"
                        : "rgba(244, 67, 54, 0.05)",
                      transition: "background-color 0.2s ease",
                      gap: "20px",
                    }}
                  >
                    <div style={{ 
                      flex: 1,
                      minWidth: 0,
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}>
                        <div style={{
                          fontSize: "0.85rem",
                          color: "#666",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "500",
                        }}>
                          {result.type}
                        </div>
                      </div>
                      
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}>
                        {/* Field and Values */}
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}>
                          <div style={{
                            fontSize: "0.9rem",
                            color: "#555",
                            fontWeight: "500",
                          }}>
                            Field: {result.field}
                          </div>
                          
                          {result.category === "FORM" ? (
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}>
                              <div style={{
                                fontSize: "0.85rem",
                                color: "#777",
                              }}>
                                Found: <span style={{
                                  fontWeight: "600",
                                  color: result.isValid ? "#333" : "#d32f2f",
                                }}>{result.formValue}</span>
                              </div>
                              <div style={{
                                fontSize: "0.85rem",
                                color: "#777",
                              }}>
                                Expected: <span style={{
                                  fontWeight: "600",
                                  color: "#4caf50",
                                }}>{result.expectedValue}</span>
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              flexWrap: "wrap",
                            }}>
                              <span style={{
                                fontWeight: "600",
                                color: result.isValid ? "#333" : "#d32f2f",
                                backgroundColor: result.isValid ? "#f1f8e9" : "#ffebee",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "0.9rem",
                              }}>
                                Form: {result.formValue}
                              </span>
                              <span style={{ color: "#999", fontSize: "14px" }}>→</span>
                              <span style={{
                                fontWeight: "600",
                                color: result.isValid ? "#333" : "#d32f2f",
                                backgroundColor: result.isValid ? "#f1f8e9" : "#ffebee",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "0.9rem",
                              }}>
                                {result.category}: {result.targetValue}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Message */}
                        <div style={{
                          fontSize: "0.85rem",
                          color: result.isValid ? "#4caf50" : "#d32f2f",
                          fontStyle: "italic",
                          padding: "6px 8px",
                          backgroundColor: result.isValid ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
                          borderRadius: "4px",
                        }}>
                          {result.message}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Icon */}
                    <div style={{ 
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: result.isValid ? "#e8f5e9" : "#ffebee",
                    }}>
                      {result.isValid ? (
                        <FaCheckCircle style={{ 
                          fontSize: "22px", 
                          color: "#4caf50" 
                        }} 
                        title="Valid" 
                        />
                      ) : (
                        <FaTimesCircle style={{ 
                          fontSize: "22px", 
                          color: "#f44336" 
                        }} 
                        title="Invalid" 
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Overall Status Indicator */}
        {overallStatus !== "no_validations" && validationResults.length > 0 && (
          <div style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: overallStatus === "success" ? "#e8f5e9" : "#ffebee",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: `1px solid ${overallStatus === "success" ? "#4caf50" : "#f44336"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}>
            {overallStatus === "success" ? (
              <>
                <FaCheckCircle style={{ fontSize: "24px", color: "#4caf50" }} />
                <div>
                  <span style={{ 
                    color: "#333", 
                    fontWeight: "600",
                    fontSize: "1.1rem",
                    display: "block"
                  }}>
                    All validations passed successfully
                  </span>
                  <span style={{
                    color: "#666",
                    fontSize: "0.9rem",
                    display: "block",
                    marginTop: "4px"
                  }}>
                    {validationResults.length} checks completed
                  </span>
                </div>
              </>
            ) : (
              <>
                <FaTimesCircle style={{ fontSize: "24px", color: "#f44336" }} />
                <div>
                  <span style={{ 
                    color: "#333", 
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    display: "block"
                  }}>
                    Some validations failed. Please review mismatches.
                  </span>
                  <span style={{
                    color: "#666",
                    fontSize: "0.75rem",
                    display: "block",
                    marginTop: "4px"
                  }}>
                    {validationResults.filter(r => !r.isValid).length} of {validationResults.length} checks failed
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for category colors
const getCategoryColor = (category) => {
  switch(category) {
    case "FORM": return "#e3f2fd"; // Light blue
    case "PAN": return "#e8f5e9"; // Light green
    case "AADHAR": return "#fff3e0"; // Light orange
    default: return "#f5f5f5";
  }
};

const getCategoryIconColor = (category) => {
  switch(category) {
    case "FORM": return "#2196f3";
    case "PAN": return "#4caf50";
    case "AADHAR": return "#ff9800";
    default: return "#666";
  }
};

export default CheckPage;