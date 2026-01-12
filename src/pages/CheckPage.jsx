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
  const [overallStatus, setOverallStatus] = useState("pending"); // pending, success, failuresssssss

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

    // Flatten Form Data (assume first page/level has the key details)
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

    // Helper to check match

    setComparisonResults(results);

    // Determine Overall Status
    if (results.length === 0) {
      setOverallStatus("no_supporting_docs");
    } else {
      const allPassed = results.every((group) =>
        group.checks.every((check) => check.isMatch)
      );
      setOverallStatus(allPassed ? "success" : "failure");

      // Trigger Popup after a short delay to ensure UI renders first
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
      <div style={{ padding: "40px", color: "white", textAlign: "center" }}>
        <FaExclamationTriangle
          style={{ fontSize: "48px", color: "#ffb74d", marginBottom: "20px" }}
        />
        <h2>Form Data Missing</h2>
        <p>Please upload and scan the main Form Document first.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "800px",
        margin: "0 auto",
        color: "#e0e0e0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "30px",
          borderBottom: "1px solid #444",
          paddingBottom: "15px",
        }}
      >
        <FaShieldAlt style={{ fontSize: "32px", color: "#4facfe" }} />
        <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Data Verification</h1>
      </div>

      {overallStatus === "no_supporting_docs" && (
        <div
          style={{
            background: "#333",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p>
            No supporting documents (PAN, GST, Aadhar) found to compare against.
          </p>
        </div>
      )}

      {comparisonResults.map((group, index) => (
        <div
          key={index}
          style={{
            marginBottom: "25px",
            background: "#1e1e1e",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #333",
          }}
        >
          <div
            style={{
              background: "#252526",
              padding: "12px 20px",
              fontWeight: "bold",
              borderBottom: "1px solid #333",
            }}
          >
            Form vs {group.type}
          </div>
          {group.checks.map((check, cIndex) => (
            <div
              key={cIndex}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "15px 20px",
                borderBottom: "1px solid #2a2a2a",
                background: check.isMatch
                  ? "rgba(16, 185, 129, 0.05)"
                  : "rgba(239, 68, 68, 0.05)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#999",
                    marginBottom: "4px",
                  }}
                >
                  {check.field}
                </div>
                <div
                  style={{
                    fontWeight: "600",
                    color: check.isMatch ? "#eee" : "#ff7b7b",
                  }}
                >
                  {check.formValue}{" "}
                  <span style={{ color: "#666", margin: "0 8px" }}>vs</span>{" "}
                  {check.targetValue}
                </div>
              </div>
              <div style={{ fontSize: "24px" }}>
                {check.isMatch ? (
                  <FaCheckCircle style={{ color: "#10b981" }} title="Match" />
                ) : (
                  <FaTimesCircle
                    style={{ color: "#ef4444" }}
                    title="Mismatch"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CheckPage;
