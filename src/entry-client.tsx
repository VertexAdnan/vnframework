import { hydrateRoot } from "react-dom/client";
import Layout from "./components/Layout";

const pagePath = (window as any).__PAGE_PATH__ || "/";
const pageModule = pagePath === "/" ? "index" : pagePath.slice(1);

(async () => {
  try {
    const PageModule = await import(`./pages/${pageModule}.js`);
    const PageComponent = PageModule.default;

    const rootElement = document.getElementById("root");
    if (rootElement) {
      hydrateRoot(
        rootElement,
        <Layout>
          <PageComponent />
        </Layout>
      );
    }
  } catch (error) {
    console.error(`Failed to load page: ${pageModule}`, error);
  }
})(); 