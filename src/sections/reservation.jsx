import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserBooking } from "../components/tools/data";
import { useNotifications } from "../components/feedback/context/notifications-context";
import { useLoading } from "../components/feedback/context/loading-context";
import { ColumnsTitle, ColumnsBody } from "../components/layout/tables";
import { ChevronDown } from "../components/layout/icons";
import "./styles/user-list.css";

export function Reservation() {
  const [userData, setUserData] = useState([]);

  const { showNotifications } = useNotifications();
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const addNewClick = () => {
    navigate("/submit-reservation");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const limit = 100;
        const hal = 0;
        const data = await fetchUserBooking(limit, hal);

        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotifications("danger", "Error fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="user-list">
      <div className="user-list-nav">
        <div className="user-list-searchbar">
          <img className="search-icon" alt="" src="/svg/search-icon.svg" />
          <input
            className="user-list-searchbar-field"
            placeholder="Search keyword ..."
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
          <button className="user-list-add" onClick={addNewClick}>
            <b className="user-list-add-text">Tambah Baru</b>
            <img className="search-icon" alt="" src="/svg/plus-icon.svg" />
          </button>
        </div>
      </div>
      <div className="user-list-body">
        <div className="user-list-head-wrap">
          <div className="user-list-head">
            <ColumnsTitle hasIcon="yes" columnsText="User Name">
              <ChevronDown width="10px" height="100%" />
            </ColumnsTitle>
            <ColumnsTitle hasIcon="yes" maxWidth="200px" columnsText="Email">
              <ChevronDown width="10px" height="100%" />
            </ColumnsTitle>
            <ColumnsTitle hasIcon="yes" maxWidth="200px" columnsText="Date">
              <ChevronDown width="10px" height="100%" />
            </ColumnsTitle>
            <ColumnsTitle hasIcon="yes" maxWidth="200px" columnsText="Phone">
              <ChevronDown width="10px" height="100%" />
            </ColumnsTitle>
            <ColumnsTitle maxWidth="120px" columnsText="Options" />
          </div>
        </div>
        {userData.map((user) => (
          <div className="user-list-row" key={user.idreservation}>
            <ColumnsBody columnsText={user.name} />
            <ColumnsBody maxWidth="200px" columnsText={user.email} />
            <ColumnsBody maxWidth="200px" columnsText={user.reservationdate} />
            <ColumnsBody maxWidth="200px" columnsText={user.phone} />
            <ColumnsBody maxWidth="120px">
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
            </ColumnsBody>
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
