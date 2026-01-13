import React, { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../services/storage";
import { usePopup } from "../context/PopupContext";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";

const CheckPage = () => {
  const { showModal } = usePopup();
  const [comparisonResults, setComparisonResults] = useState([]);
  const [overallStatus, setOverallStatus] = useState("pending"); // pending, success, failure

  useEffect(() => {
    performChecks();
  }, []);

  const normalizeString = (str) => {
    return str ? str.toString().toLowerCase().trim().replace(/\s+/g, " ") : "";
  };

  const normalizeKey = (key) =>
    key
      .toLowerCase()
      .replace(/[_\s]+/g, " ")
      .trim();

  const normalizeValue = (val) =>
    val ? val.toString().toLowerCase().trim().replace(/\s+/g, " ") : "";

  const compareObjectsByCommonKeys = (formObj = {}, docObj = {}) => {
    const formMap = Object.entries(formObj).reduce((acc, [k, v]) => {
      acc[normalizeKey(k)] = v;
      return acc;
    }, {});

    const docMap = Object.entries(docObj).reduce((acc, [k, v]) => {
      acc[normalizeKey(k)] = v;
      return acc;
    }, {});

    const commonKeys = Object.keys(formMap).filter((key) => key in docMap);

    return commonKeys.map((key) => ({
      field: key,
      formValue: formMap[key] ?? "N/A",
      targetValue: docMap[key] ?? "N/A",
      isMatch: normalizeValue(formMap[key]) === normalizeValue(docMap[key]),
    }));
  };

  const flattenAllPages = (data = {}) => {
    return Object.values(data).reduce((acc, page) => {
      if (page && typeof page === "object") {
        Object.assign(acc, page);
      }
      return acc;
    }, {});
  };

  const performChecks = () => {
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
    const gstData = gstDataStr ? JSON.parse(gstDataStr) : null;
    const aadharData = aadharDataStr ? JSON.parse(aadharDataStr) : null;

    // Flatten Form Data
    const formFlat = flattenAllPages(formData);
    const results = [];

    if (panData) {
      const panFlat = flattenAllPages(panData);
      results.push({
        type: "PAN",
        checks: compareObjectsByCommonKeys(formFlat, panFlat),
      });
    }

    if (aadharData) {
      const aadharFlat = flattenAllPages(aadharData);
      results.push({
        type: "Aadhar",
        checks: compareObjectsByCommonKeys(formFlat, aadharFlat),
      });
    }

    if (gstData) {
      const gstFlat = flattenAllPages(gstData);
      results.push({
        type: "GST",
        checks: compareObjectsByCommonKeys(formFlat, gstFlat),
      });
    }

    setComparisonResults(results);

    // Determine Overall Status
    if (results.length === 0) {
      setOverallStatus("no_supporting_docs");
    } else {
      const allPassed = results.every((group) =>
        group.checks.every((check) => check.isMatch)
      );
      setOverallStatus(allPassed ? "success" : "failure");

      // Trigger Popup after a short delay
      setTimeout(() => {
        showModal({
          title: allPassed ? "Verification Successful" : "Verification Failed",
          message: allPassed
            ? "All data points match between the Form and provided documents."
            : "Mismatches were found between the Form and supporting documents. Please review the highlighted errors.",
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
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "30px",
          borderBottom: "1px solid #e0e0e0",
          paddingBottom: "15px",
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          <FaShieldAlt style={{ fontSize: "32px", color: "#2196f3" }} />
          <h1 style={{ 
            margin: 0, 
            fontSize: "1.8rem",
            color: "#333",
            fontWeight: "600"
          }}>Data Verification</h1>
        </div>

        {/* Main Content - Scrollable Area */}
        <div style={{
          height: "calc(100vh - 150px)",
          overflowY: "auto",
          paddingRight: "10px",
          WebkitOverflowScrolling: "touch",
        }}>
          {overallStatus === "no_supporting_docs" && (
            <div style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid #e0e0e0",
            }}>
              <FaExclamationTriangle 
                style={{ fontSize: "36px", color: "#ff9800", marginBottom: "15px" }}
              />
              <p style={{ 
                color: "#666", 
                fontSize: "16px",
                margin: 0 
              }}>
                No supporting documents (PAN, GST, Aadhar) found to compare against.
              </p>
            </div>
          )}

          {comparisonResults.map((group, index) => (
            <div
              key={index}
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
                backgroundColor: "#f8f9fa",
                padding: "16px 24px",
                fontWeight: "600",
                borderBottom: "1px solid #e0e0e0",
                color: "#333",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <FaShieldAlt style={{ fontSize: "18px", color: "#2196f3" }} />
                Form vs {group.type}
              </div>

              {/* Comparison Items */}
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {group.checks.map((check, cIndex) => (
                  <div
                    key={cIndex}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      padding: "20px 24px",
                      borderBottom: cIndex !== group.checks.length - 1 ? "1px solid #f0f0f0" : "none",
                      backgroundColor: check.isMatch
                        ? "rgba(76, 175, 80, 0.05)"
                        : "rgba(244, 67, 54, 0.05)",
                      transition: "background-color 0.2s ease",
                      gap: "20px",
                    }}
                  >
                    <div style={{ 
                      flex: 1,
                      minWidth: 0, // Prevents overflow issues
                    }}>
                      <div style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: "500",
                      }}>
                        {check.field}
                      </div>
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}>
                          <span style={{
                            fontWeight: "600",
                            color: check.isMatch ? "#333" : "#d32f2f",
                            backgroundColor: check.isMatch ? "#f1f8e9" : "#ffebee",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.9rem",
                          }}>
                            Form: {check.formValue}
                          </span>
                          <span style={{ color: "#999", fontSize: "14px" }}>→</span>
                          <span style={{
                            fontWeight: "600",
                            color: check.isMatch ? "#333" : "#d32f2f",
                            backgroundColor: check.isMatch ? "#f1f8e9" : "#ffebee",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.9rem",
                          }}>
                            {group.type}: {check.targetValue}
                          </span>
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
                      backgroundColor: check.isMatch ? "#e8f5e9" : "#ffebee",
                    }}>
                      {check.isMatch ? (
                        <FaCheckCircle style={{ 
                          fontSize: "22px", 
                          color: "#4caf50" 
                        }} 
                        title="Match" 
                        />
                      ) : (
                        <FaTimesCircle style={{ 
                          fontSize: "22px", 
                          color: "#f44336" 
                        }} 
                        title="Mismatch" 
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
        {overallStatus !== "no_supporting_docs" && comparisonResults.length > 0 && (
          <div style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}>
            {overallStatus === "success" ? (
              <>
                <FaCheckCircle style={{ fontSize: "24px", color: "#4caf50" }} />
                <span style={{ 
                  color: "#333", 
                  fontWeight: "600",
                  fontSize: "1.1rem"
                }}>
                  All verifications passed successfully
                </span>
              </>
            ) : (
              <>
                <FaTimesCircle style={{ fontSize: "24px", color: "#f44336" }} />
                <span style={{ 
                  color: "#333", 
                  fontWeight: "600",
                  fontSize: "1.1rem"
                }}>
                  Some verifications failed. Please review mismatches.
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckPage;