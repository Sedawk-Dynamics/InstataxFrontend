import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation(); // Get current URL path

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scrolls to top smoothly
  }, [pathname]); // Runs every time the pathname (URL) changes

  return null; // This component doesn't render anything
};

export default ScrollToTop;
