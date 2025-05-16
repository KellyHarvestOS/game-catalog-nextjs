// components/Footer.tsx
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
      <p>© {new Date().getFullYear()} GameHub. Все права защищены (нет).</p>
    </footer>
  );
};

export default Footer;