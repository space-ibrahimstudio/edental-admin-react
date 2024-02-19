import React from "react";
import { ChevronIcon } from "../layout/icons";
import "./styles/pagination.css";

export function Pagination({ currentPage, totalPages, handlePagination }) {
  const prevPage = () => {
    if (currentPage > 1) {
      handlePagination(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      handlePagination(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pagesToShow = [];
    const maxPages = 4;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pagesToShow.push(i);
      }
    } else {
      const leftBound = Math.max(2, currentPage - 2);
      const rightBound = Math.min(currentPage + 2, totalPages - 1);

      pagesToShow.push(1);
      if (leftBound > 2) {
        pagesToShow.push("ellipsis");
      }
      for (let i = leftBound; i <= rightBound; i++) {
        pagesToShow.push(i);
      }
      if (rightBound < totalPages - 1) {
        pagesToShow.push("ellipsis");
      }
      pagesToShow.push(totalPages);
    }

    return pagesToShow.map((pageNumber, index) => (
      <button
        key={index}
        className={`pagination-arrow ${
          pageNumber === "ellipsis" ? "ellipsis" : ""
        } ${currentPage === pageNumber ? "active" : ""}`}
        onClick={() => handlePagination(pageNumber)}
      >
        {pageNumber === "ellipsis" ? (
          <b className="pagination-num-text">...</b>
        ) : (
          <b className="pagination-num-text">{pageNumber}</b>
        )}
      </button>
    ));
  };

  return (
    <div className="pagination">
      <button
        className="pagination-arrow"
        style={{ display: currentPage === 1 ? "none" : "flex" }}
        onClick={prevPage}
      >
        <ChevronIcon width="7px" height="100%" direction="left" />
      </button>
      {renderPageNumbers()}
      <button
        className="pagination-arrow"
        style={{ display: currentPage === totalPages ? "none" : "flex" }}
        onClick={nextPage}
      >
        <ChevronIcon width="7px" height="100%" />
      </button>
    </div>
  );
}
