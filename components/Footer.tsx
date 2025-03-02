import { Code } from "lucide-react";

export function Footer() {
    return (
        <footer className="py-12 border-t border-gray-900 bg-[#272626] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold flex items-center">
                <Code className="mr-2 text-emerald-400" /> CodeX
              </h2>
              <p className="text-gray-400 mt-2">© 2025 CodeX. All rights reserved.</p>
            </div>
  
            <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    )
  }