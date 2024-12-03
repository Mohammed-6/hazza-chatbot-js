import axios from "axios";
import { useEffect } from "react";
export const baseUrl = "http://localhost:4000/api";

export const postRequest = async (url, body) => {
  return await axios
    .post(url, body, {
      headers: {
        "Content-Type": "application/json",
        "package-id": localStorage.getItem("hazza-packageId"),
      },
    })
    .then((response) => {
      return { error: false, response };
    })
    .catch((error) => {
      return { error: true, message: error?.response?.data };
    });
};

export const getRequest = async (url) => {
  return await axios
    .get(url, {
      headers: { "package-id": localStorage.getItem("hazza-packageId") },
    })
    .then((response) => {
      return { error: false, response };
    })
    .catch((error) => {
      return { error: true, message: error?.response?.data };
    });
};

export function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Function to convert an object to table rows
export function objectToTable(data) {
  // useEffect(() => {
  //   if (type === "receiveData") {
  //   }
  // }, []);
  return (
    <table>
      <thead>
        <tr className="border border-gray-200 px-1 py-2">
          <th className="border border-gray-200 px-1 py-2">Key</th>
          <th className="border border-gray-200 px-1 py-2">Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(JSON.parse(data.receiveData)).map(([key, value]) => (
          <tr key={key} className="border border-gray-200 px-1 py-2">
            <td className="border border-gray-200 px-1 py-2">{key}</td>
            <td className="border border-gray-200 px-1 py-2">
              {value.toString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
