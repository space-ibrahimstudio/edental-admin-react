import React, { useState, useEffect } from "react";
import { useNotifications } from "../../components/feedback/context/notifications-context";
import { useParams } from "react-router-dom";
import { fetchLogStock } from "../../components/tools/data";

const StockHistory = () => {
  const { showNotifications } = useNotifications();
  const { stockName } = useParams();
  const [stockData, setStockData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchLogStock(stockName);
        setStockData(data);
      } catch (error) {
        console.error("Error fetching history stock data:", error);
        showNotifications("danger", "Error fetching history stock data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [stockName]);

  return (
    <div>
      <h2>Stock Details for {stockName}</h2>
    </div>
  );
};

export default StockHistory;
