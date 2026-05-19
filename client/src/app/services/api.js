  import axios from "axios";

  const API = axios.create({
    baseURL: "https://coaching-feed-vfui.onrender.com",
  });

  export default API;