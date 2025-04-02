import { atom, selectorFamily } from "recoil";
import axios from "axios";

export const equipmentListAtom = atom({
  key: "equipmentListAtom",
  default: [],
});

// for fetching data from the backend
export const equipmentList = selectorFamily({
  key: "equipmentListSelector",
  get: ({ id, requestType }) => async () => {
    try {
      const res = await axios({
        url: `http://localhost:5000/api/equipment/${id}`, // equipment id
        method: requestType,
        headers: { "x-auth-token": localStorage.getItem("token") },
      });

      return res.data; 
    } catch (error) {
      throw error;
    }
  },
});
