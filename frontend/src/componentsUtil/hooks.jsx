import axios from "axios";
import { useState, useEffect } from "react";

// useFetch hook to fetch data from the backend given a url and the requestType
export const useFetch = (url, requestType) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function getData() {
    setLoading(true);
    setError(null);

    try {
      const res = await axios({
        url: url,
        method: requestType,
        headers: { "x-auth-token": `${localStorage.getItem("token")}` },
      });

      setData(res);
    } catch (error) {
      console.log("error fetching data ", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  // fetch everytime url/requestType changes
  useEffect(() => {
    getData();
  }, [url, requestType]);

  return {
    data,
    loading,
    error,
  };
};
