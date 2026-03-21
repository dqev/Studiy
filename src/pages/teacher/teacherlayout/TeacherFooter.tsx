import * as React from 'react';
import { Award, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TeacherFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-white mt-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-amber-600 p-1.5 rounded-lg">
                                <Award className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">Studiy Teacher</span>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Create and share high-quality educational content with your students.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><Link to="/teacher/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                            <li><Link to="/teacher/materials" className="hover:text-white transition-colors">My Materials</Link></li>
                            <li><Link to="/teacher/upload" className="hover:text-white transition-colors">Upload Material</Link></li>
                            <li><Link to="/teacher/my-classes" className="hover:text-white transition-colors">My Classes</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                            <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="/how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                            <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-800 pt-8">
                    {/* Bottom Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-slate-400 text-sm">
                            © {currentYear} Studiy. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-slate-400 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Status</a>
                            <a href="#" className="hover:text-white transition-colors">Support</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
