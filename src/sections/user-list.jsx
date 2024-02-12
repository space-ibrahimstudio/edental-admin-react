import React, { useState, useEffect } from "react";
import { fetchUserData } from "../components/tools/data";
import { useNotifications } from "../components/feedback/context/notifications-context";
import "../pages/styles/user-list.css";

const Columns = ({ children, maxWidth }) => {
  return (
    <div className="user-list-head-name" style={{ maxWidth: maxWidth }}>
      {children}
    </div>
  );
};

export function UserList({ title }) {
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { showNotifications } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUserData(showNotifications);
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="user-list">
      <header className="user-list-heading">
        <b className="user-list-title">{title}</b>
        <div className="user-list-line" />
      </header>
      <div className="user-list-nav">
        <div className="user-list-searchbar">
          <img className="search-icon" alt="" src="/svg/search-icon.svg" />
          <input
            className="user-list-searchbar-field"
            placeholder="Search by name ..."
            type="text"
          />
        </div>
        <div className="user-list-option">
          <button className="user-list-filter">
            <b className="user-list-filter-text">Baris : 5</b>
            <img
              className="chevron-down-icon"
              alt=""
              src="/svg/chevron-down-icon.svg"
            />
          </button>
          <button className="user-list-add">
            <b className="user-list-add-text">Tambah Baru</b>
            <img className="search-icon" alt="" src="/svg/plus-icon.svg" />
          </button>
        </div>
      </div>
      <div className="user-list-body">
        <div className="user-list-head-wrap">
          <div className="user-list-head">
            <Columns>
              <b className="user-list-title">Nama Pengguna</b>
              <img
                className="chevron-down-icon"
                loading="lazy"
                alt=""
                src="/svg/chevron-down-icon.svg"
              />
            </Columns>
            <Columns maxWidth="200px">
              <b className="user-list-title">Date Joined</b>
              <img
                className="chevron-down-icon"
                loading="lazy"
                alt=""
                src="/svg/chevron-down-icon.svg"
              />
            </Columns>
            <Columns maxWidth="150px">
              <b className="user-list-title">User ID</b>
              <img
                className="chevron-down-icon"
                loading="lazy"
                alt=""
                src="/svg/chevron-down-icon.svg"
              />
            </Columns>
            <Columns maxWidth="200px">
              <b className="user-list-title">Level</b>
              <img
                className="chevron-down-icon"
                loading="lazy"
                alt=""
                src="/svg/chevron-down-icon.svg"
              />
            </Columns>
            <Columns maxWidth="150px">
              <b className="user-list-title">Pilihan</b>
            </Columns>
          </div>
        </div>
        {userData.map((user) => (
          <div className="user-list-row" key={user.idauth}>
            <Columns>
              <div className="user-list-row-name-text">{user.username}</div>
            </Columns>
            <Columns maxWidth="200px">
              <div className="user-list-row-name-text">{user.datetimeuser}</div>
            </Columns>
            <Columns maxWidth="150px">
              <div className="user-list-row-name-text">{user.idauth}</div>
            </Columns>
            <Columns maxWidth="200px">
              <div className="user-list-row-name-text">{user.level}</div>
            </Columns>
            <Columns maxWidth="150px">
              <button className="user-list-row-more">
                <img
                  className="more-icon"
                  loading="lazy"
                  alt=""
                  src="/svg/more-icon.svg"
                />
              </button>
              <button className="user-list-row-more">
                <img
                  className="edit-icon"
                  loading="lazy"
                  alt=""
                  src="/svg/edit-icon.svg"
                />
              </button>
            </Columns>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button className="pagination-arrow">
          <img
            className="chevron-left-icon"
            alt="Previous"
            src="/svg/chevron-left-icon.svg"
          />
        </button>
        <button className="pagination-arrow">
          <b className="pagination-num-text">1</b>
        </button>
        <button className="pagination-arrow">
          <b className="pagination-num-text">2</b>
        </button>
        <button className="pagination-arrow">
          <b className="pagination-num-text">3</b>
        </button>
        <button className="pagination-arrow">
          <b className="pagination-num-text">4</b>
        </button>
        <button className="pagination-arrow">
          <img
            className="chevron-left-icon"
            alt="Next"
            src="/svg/chevron-right-icon.svg"
          />
        </button>
      </div>
    </section>
  );
}
