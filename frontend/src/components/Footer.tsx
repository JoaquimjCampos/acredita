import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white py-8 mt-16" aria-label="Rodapé">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
      <div className="mb-4 md:mb-0 text-center md:text-left">
        <span className="font-bold">Acredita</span> &copy; {new Date().getFullYear()}<br />
        <span className="text-xs text-gray-400">Todos os direitos reservados.</span>
      </div>
      <div className="flex space-x-4">
        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-acredita-primary transition-colors duration-200">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
        </a>
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-acredita-primary transition-colors duration-200">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.094 12 2.094m0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.659.334 3.678 1.315c-.98.98-1.187 2.092-1.245 3.373C2.012 5.668 2 6.077 2 12c0 5.923.012 6.332.07 7.612.058 1.281.265 2.393 1.245 3.373.98.98 2.092 1.187 3.373 1.245C8.332 23.988 8.741 24 12 24s3.668-.012 4.948-.07c1.281-.058 2.393-.265 3.373-1.245.98-.98 1.187-2.092 1.245-3.373.058-1.28.07-1.689.07-7.612 0-5.923-.012-6.332-.07-7.612-.058-1.281-.265-2.393-1.245-3.373-.98-.98-2.092-1.187-3.373-1.245C15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm7.2-11.406a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
        </a>
        <a href="mailto:contato@acredita.ao" aria-label="Email" className="hover:text-acredita-primary transition-colors duration-200">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 13.065L2.4 6.6V18h19.2V6.6l-9.6 6.465zm9.6-10.065H2.4C1.074 3 0 4.074 0 5.4v13.2C0 19.926 1.074 21 2.4 21h19.2c1.326 0 2.4-1.074 2.4-2.4V5.4c0-1.326-1.074-2.4-2.4-2.4z"/></svg>
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
