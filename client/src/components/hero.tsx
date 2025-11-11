export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const nav = document.querySelector('nav') as HTMLElement | null;
      const offset = nav ? nav.offsetHeight + 8 : 72;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 float-animation"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 float-animation-delayed"></div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center relative z-10">
        <div className="section-reveal">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-white">ATHARV ANANDA</span>
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">BHOSALE</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Software Developer | Problem Solver | Tech Enthusiast
          </p>
          
          <p className="text-lg text-gray-400 mb-8 flex items-center justify-center gap-2">
            <i className="fas fa-map-marker-alt text-blue-400"></i>
            Pune, Maharashtra | BE CSE @ SPPU
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a 
              href="https://drive.google.com/file/d/1oqVyYvwp-y0GcTCZebGdbwdY-8Pchree/view?usp=sharing"
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
            >
              <i className="fas fa-file-pdf"></i>
              View Resume
            </a>
            
            <button 
              onClick={() => scrollToSection('contact')}
              className="border-2 border-gray-600 hover:border-white text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black flex items-center gap-2"
            >
              <i className="fas fa-envelope"></i>
              Contact Me
            </button>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6">
            <a 
              href="https://github.com/Atharv1136" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 transform"
            >
              <i className="fab fa-github text-2xl"></i>
            </a>
            <a 
              href="https://www.linkedin.com/in/atharvbhosale/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors duration-300 hover:scale-110 transform"
            >
              <i className="fab fa-linkedin text-2xl"></i>
            </a>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <button 
          onClick={() => scrollToSection('about')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <i className="fas fa-chevron-down text-2xl"></i>
        </button>
      </div>
    </section>
  );
}
