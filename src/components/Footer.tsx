export default function Footer() {
  return (
    <footer className="text-zerogreen py-4 mt-10 ">
      <div className="container mx-auto text-center font-mono text-sm">
        <p>© {new Date().getFullYear()} ZeroDayCTF — Hack. Learn. Evolve.</p>
      </div>
    </footer>
  );
}
