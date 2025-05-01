import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div>
      <h1>Inicio de AiDuxCare</h1>
      <ul>
        <li>
          <Link to="/patients/eva-martinez-1988/visits">Visitas de Eva Martínez</Link>
        </li>
        <li>
          <Link to="/patients/marta-perez-1985/visits">Visitas de Marta Pérez</Link>
        </li>
        <li>
          <Link to="/patients/nuria-arnedo-1990/visits">Visitas de Nuria Arnedo</Link>
        </li>
      </ul>
    </div>
  );
};

export default HomePage;
