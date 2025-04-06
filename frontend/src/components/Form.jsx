// import { useState } from "react";
// import api from "../api";
// import { useNavigate } from "react-router-dom";
// import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
// import GoogleLoginButton from "./GoogleLoginButton"; 
// import '../styles/Form.css'

// function Form({ route, method }) {
//     const [username, setUsername] = useState("");
//     const [email, setEmail] = useState("");  
//     const [password, setPassword] = useState("");
//     const navigate = useNavigate();

//     const name = method === "login" ? "Login" : "Register";

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             const payload = method === "login"
//                 ? { username, password }
//                 : { username, email, password }; 

//             const res = await api.post(route, payload);
//             if (method === "login") {
//                 localStorage.setItem(ACCESS_TOKEN, res.data.access);
//                 localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
//                 navigate("/");
//             } else {
//                 navigate("/login");
//             }
//         } catch (error) {
//             alert(error);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="form-container">
//             <h1>{name}</h1>
//             <input
//                 className="form-input"
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 placeholder="Username"
//             />
//             {method === "register" && (  
//                 <input
//                     className="form-input"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Email"
//                 />
//             )}
//             <input
//                 className="form-input"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Password"
//             />
//             <button className="form-button" type="submit">
//                 {name}
//             </button>
//             <div>
//                 <GoogleLoginButton />
//             </div>
//         </form>
//     );
// }

// export default Form;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import GoogleLoginButton from "./GoogleLoginButton"; 
import { useAuth } from "../components/AuthContext";
import "../styles/Form.css";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { setIsLoggedIn, setToken } = useAuth();

  const isLogin = method === "login";
  const formTitle = isLogin ? "Login" : "Register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = isLogin
        ? { username, password }
        : { username, email, password };

      const res = await api.post(route, payload);

      if (isLogin) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        setToken(res.data.access);
        setIsLoggedIn(true);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || "An error occurred";
      setError(errMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>{formTitle}</h1>

      {error && <p className="form-error">{error}</p>}

      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />

      {!isLogin && (
        <input
          className="form-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
      )}

      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button className="form-button" type="submit">
        {formTitle}
      </button>

      {isLogin && (
        <div style={{ marginTop: "1rem" }}>
          <GoogleLoginButton />
        </div>
      )}
    </form>
  );
}

export default Form;
