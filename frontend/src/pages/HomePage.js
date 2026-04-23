import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { ProductGrid } from "../components/ProductGrid";
import { Contact } from "../components/Contact";
import { Newsletter } from "../components/Newsletter";

export default function HomePage() {
  return (
    <main data-testid="home-page">
      <Hero />
      <ProductGrid />
      <About />
      <Newsletter />
      <Contact />
    </main>
  );
}
