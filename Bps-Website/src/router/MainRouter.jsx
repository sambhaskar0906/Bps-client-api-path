import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PublicRouter from "./routes/PublicRouter";

// Public Pages
import Home from "../page/public/Home";
import About from "../page/public/About";
import Career from "../page/public/Career";
import Contact from "../page/public/Contact";
import Employer from "../page/public/Employer";
import Ites from "../page/public/Ites";
import Services from "../page/public/Services";
import Login from "../components/Login";

// New Components
import TermsAndConditions from "../page/TermsAndConditions";
import PrivacyPolicy from "../page/PrivacyPolicy";

// Services detail components
import AirCourier from "../page/public/AirService";
import TrainCourier from "../page/public/TrainService";
import RoadCourier from "../page/public/RoadService";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <PublicRouter />,
    children: [
      { path: "", index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "career", element: <Career /> },
      { path: "contact", element: <Contact /> },
      // { path: "employer", element: <Employer /> },
      // { path: "ites", element: <Ites /> },
      { path: "login", element: <Login /> },
      { path: "services", element: <Services /> },

      // New Routes
      { path: "terms-and-conditions", element: <TermsAndConditions /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },

      // Service Details with separate components
      { path: "services/air-courier", element: <AirCourier /> },
      { path: "services/train-courier", element: <TrainCourier /> },
      { path: "services/road-courier", element: <RoadCourier /> },
    ],
  },
]);

export default function MainRouter() {
  return <RouterProvider router={routers} />;
}