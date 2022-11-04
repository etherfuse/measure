import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import PoliticalCharts from "./Components/PoliticalChart";
import ValidatorMap from "./Components/ValidatorMap";
import Taxonomy from "./Components/Taxonomy";
import Sources from "./Components/Sources";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import CorporateCharts from "./Components/CorporateChart";
import OwnershipsCharts from "./Components/OwnershipChart";
import RegionalCharts from "./Components/RegionalChart";

function App() {
  const location = useLocation();
  const pathname =
    location.pathname == "/" ? "/validator-map" : location.pathname;

  return (
    <>
      <Navbar
        bg="#e4ff3f"
        style={{ display: "flex", justifyContent: "space-around" }}
      >
        <a href="/">
          <img src="logo.png" alt="logo.png" />
        </a>
        <Nav defaultActiveKey={pathname}>
          <Nav.Link as={Link} to="/validator-map" href="/validator-map">
            Validator Map
          </Nav.Link>
          <Nav.Link as={Link} to="/political-charts" href="/political-charts">
            Political
          </Nav.Link>
          <Nav.Link as={Link} to="/regional-charts" href="/regional-charts">
            Regional
          </Nav.Link>
          <Nav.Link as={Link} to="/corporate-charts" href="/corporate-charts">
            Corporate
          </Nav.Link>
          <Nav.Link as={Link} to="/ownership-charts" href="/ownership-charts">
            Ownership
          </Nav.Link>
          <Nav.Link as={Link} to="/taxonomy" href="/taxonomy">
            Taxonomy
          </Nav.Link>
          <Nav.Link as={Link} to="/sources" href="/sources">
            Sources
          </Nav.Link>
        </Nav>
      </Navbar>
      <br />
      <Routes>
        <Route path="/" element={<Navigate to="/validator-map" />} />
        <Route path="/validator-map" element={<ValidatorMap />} />
        <Route path="/political-charts" element={<PoliticalCharts />} />
        <Route path="/corporate-charts" element={<CorporateCharts />} />
        <Route path="/ownership-charts" element={<OwnershipsCharts />} />
        <Route path="/regional-charts" element={<RegionalCharts />} />
        <Route path="/taxonomy" element={<Taxonomy />} />
        <Route path="/sources" element={<Sources />} />
      </Routes>
    </>
  );
}

export default App;
