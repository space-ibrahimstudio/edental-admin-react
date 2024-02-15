import React, { useState } from "react";
import { ChevronIcon } from "../layout/icons";
import "./styles/pagination.css";

export function Pagination({
  totalRows,
  rowsPerPage,
  currentPage,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];

    // if (totalPages <= 5) {
    //   for (let i = 1; i <= totalPages; i++) {
    //     pageNumbers.push(
    //       <button
    //         key={i}
    //         className={`pagination-arrow ${i === currentTable ? "active" : ""}`}
    //         onClick={() => paginate(i)}
    //       >
    //         <b className="pagination-num-text">{i}</b>
    //       </button>
    //     );
    //   }
    // } else {
    //   if (currentTable <= 3) {
    //     for (let i = 1; i <= 4; i++) {
    //       pageNumbers.push(
    //         <button
    //           key={i}
    //           className={`pagination-arrow ${
    //             i === currentTable ? "active" : ""
    //           }`}
    //           onClick={() => paginate(i)}
    //         >
    //           <b className="pagination-num-text">{i}</b>
    //         </button>
    //       );
    //     }
    //     pageNumbers.push(
    //       <button
    //         key="ellipsis1"
    //         className="pagination-arrow"
    //         style={{ cursor: "default" }}
    //       >
    //         <b className="pagination-num-text">...</b>
    //       </button>
    //     );
    //     pageNumbers.push(
    //       <button
    //         key={totalPages}
    //         className="pagination-arrow"
    //         onClick={() => paginate(totalPages)}
    //       >
    //         <b className="pagination-num-text">{totalPages}</b>
    //       </button>
    //     );
    //   } else if (currentTable > totalPages - 3) {
    //     pageNumbers.push(
    //       <button
    //         key={1}
    //         className="pagination-arrow"
    //         onClick={() => paginate(1)}
    //       >
    //         <b className="pagination-num-text">1</b>
    //       </button>
    //     );
    //     pageNumbers.push(
    //       <button
    //         key="ellipsis2"
    //         className="pagination-arrow"
    //         style={{ cursor: "default" }}
    //       >
    //         <b className="pagination-num-text">...</b>
    //       </button>
    //     );
    //     for (let i = totalPages - 3; i <= totalPages; i++) {
    //       pageNumbers.push(
    //         <button
    //           key={i}
    //           className={`pagination-arrow ${
    //             i === currentTable ? "active" : ""
    //           }`}
    //           onClick={() => paginate(i)}
    //         >
    //           <b className="pagination-num-text">{i}</b>
    //         </button>
    //       );
    //     }
    //   } else {
    //     pageNumbers.push(
    //       <button
    //         key={1}
    //         className="pagination-arrow"
    //         onClick={() => paginate(1)}
    //       >
    //         <b className="pagination-num-text">1</b>
    //       </button>
    //     );
    //     pageNumbers.push(
    //       <button
    //         key="ellipsis3"
    //         className="pagination-arrow"
    //         style={{ cursor: "default" }}
    //       >
    //         <b className="pagination-num-text">...</b>
    //       </button>
    //     );
    //     for (let i = currentTable - 1; i <= currentTable + 1; i++) {
    //       pageNumbers.push(
    //         <button
    //           key={i}
    //           className={`pagination-arrow ${
    //             i === currentTable ? "active" : ""
    //           }`}
    //           onClick={() => paginate(i)}
    //         >
    //           <b className="pagination-num-text">{i}</b>
    //         </button>
    //       );
    //     }
    //     pageNumbers.push(
    //       <button
    //         key="ellipsis4"
    //         className="pagination-arrow"
    //         style={{ cursor: "default" }}
    //       >
    //         <b className="pagination-num-text">...</b>
    //       </button>
    //     );
    //     pageNumbers.push(
    //       <button
    //         key={totalPages}
    //         className="pagination-arrow"
    //         onClick={() => paginate(totalPages)}
    //       >
    //         <b className="pagination-num-text">{totalPages}</b>
    //       </button>
    //     );
    //   }
    // }

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`pagination-arrow ${i === currentPage ? "active" : ""}`}
          onClick={() => onPageChange(i)}
        >
          <b className="pagination-num-text">{i}</b>
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-arrow"
        style={{ display: currentPage === 1 ? "none" : "flex" }}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronIcon width="7px" height="100%" direction="left" />
      </button>
      {renderPageNumbers()}
      <button
        className="pagination-arrow"
        style={{ display: currentPage === totalPages ? "none" : "flex" }}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronIcon width="7px" height="100%" />
      </button>
    </div>
  );
}
