import React from "react";
import { ChevronIcon } from "../layout/icons";
import pgnt from "./styles/pagination.module.css";

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
        className={`${pgnt.paginationArrow} ${
          pageNumber === "ellipsis" ? pgnt.ellipsis : ""
        } ${currentPage === pageNumber ? pgnt.active : ""}`}
        onClick={() => handlePagination(pageNumber)}
      >
        {pageNumber === "ellipsis" ? (
          <b className={pgnt.paginationNumText}>...</b>
        ) : (
          <b className={pgnt.paginationNumText}>{pageNumber}</b>
        )}
      </button>
    ));
  };

  return (
    <div className={pgnt.pagination}>
      <button
        className={pgnt.paginationArrow}
        style={{ display: currentPage === 1 ? "none" : "flex" }}
        onClick={prevPage}
      >
        <ChevronIcon width="7px" height="100%" direction="left" />
      </button>
      {renderPageNumbers()}
      <button
        className={pgnt.paginationArrow}
        style={{ display: currentPage === totalPages ? "none" : "flex" }}
        onClick={nextPage}
      >
        <ChevronIcon width="7px" height="100%" />
      </button>
    </div>
  );
}
