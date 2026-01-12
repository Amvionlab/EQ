import React from 'react';
import { FaDatabase } from 'react-icons/fa';

const ResultsTable = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="results-wrapper">
                <div className="no-data">
                    <FaDatabase />
                    <p>No data extracted</p>
                </div>
            </div>
        );
    }

    return (
        <table className="results-table">
            <thead>
                <tr>
                    <th>Field</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(data).map(([pageKey, pageData]) => (
                    <React.Fragment key={pageKey}>
                        <tr>
                            <td colSpan="2" className="page-header">
                                {pageKey.toUpperCase()}
                            </td>
                        </tr>
                        {Object.entries(pageData || {}).map(([key, value]) => (
                            <tr key={`${pageKey}-${key}`}>
                                <td className="key-column">{key.replace(/_/g, ' ').toUpperCase()}</td>
                                <td className="value-column">{value || <span className="text-muted">N/A</span>}</td>
                            </tr>
                        ))}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
};

export default ResultsTable;
